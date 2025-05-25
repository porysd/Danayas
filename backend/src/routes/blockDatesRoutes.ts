import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { BlockedDatesTable } from "../schemas/BlockedDates";
import {
  BlockedDatesDTO,
  CreateBlockedDatesDTO,
  UpdateBlockedDatesDTO,
} from "../dto/blockedDatesDTO";
import { and, eq, ne, sql } from "drizzle-orm";
import { processBookingData } from "../utils/dateHelpers";
import { UsersTable } from "../schemas/User";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";
import { AuditLogsTable } from "../schemas/schema";

const blockedRoutes = new OpenAPIHono<AuthContext>();

blockedRoutes.use("/*", authMiddleware);

blockedRoutes.openapi(
  createRoute({
    tags: ["Blocked Dates"],
    summary: "Get all blocked dates",
    method: "get",
    path: "/",
    request: {
      query: z.object({
        limit: z.coerce.number().nonnegative().openapi({
          example: 50,
          description: "Limit that the server will give",
        }),
        page: z.coerce.number().nonnegative().openapi({
          example: 1,
          description: "Page to get",
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: BlockedDatesDTO.array(),
          },
        },
        description: "Get all blocked dates",
      },
      400: {
        description: "Invalid Request",
      },
      404: {
        description: "No blocked dates found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "BLOCKED_DATES",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get blocked dates.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const blocked = await db.query.BlockedDatesTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allBlocked = blocked.map((b) => {
        try {
          return BlockedDatesDTO.parse(b);
        } catch (e) {
          throw new BadRequestError("Invalid blocked dates");
        }
      });
      return c.json({
        total: blocked.length,
        items: allBlocked,
      });
    } catch (e) {
      return errorHandler(e, c);
    }
  }
);

blockedRoutes.openapi(
  createRoute({
    tags: ["Blocked Dates"],
    summary: "Get blocked dates by id",
    method: "get",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce.number().openapi({ description: "Blocked dates ID" }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: BlockedDatesDTO,
          },
        },
        description: "Get all blocked dates",
      },
      400: {
        description: "Invalid Request",
      },
      404: {
        description: "No blocked dates found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),

  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "BLOCKED_DATES",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get blocked dates.");
      }

      const { id } = c.req.valid("param");
      const blocked = await db.query.BlockedDatesTable.findFirst({
        where: eq(BlockedDatesTable.blockedDatesId, id),
      });

      if (!blocked) {
        throw new NotFoundError("Booking not found.");
      }

      return c.json(BlockedDatesDTO.parse(blocked));
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

blockedRoutes.openapi(
  createRoute({
    tags: ["Blocked Dates"],
    summary: "Create Blocked Dates",
    method: "post",
    path: "/",
    request: {
      body: {
        description: "Blocked Dates credentials",
        required: true,
        content: {
          "application/json": {
            schema: CreateBlockedDatesDTO,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: CreateBlockedDatesDTO,
          },
        },
        description: "Blocked Dates created successfully",
      },
      400: {
        description: "Invalid blocked dates",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "BLOCKED_DATES",
        "create"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create blocked dates.");
      }

      const body = await c.req.json();
      const { category, others } = body;

      if (category === "others" && (!others || others.trim() === "")) {
        throw new BadRequestError(
          "Others reason is required for 'others' category"
        );
      }

      const format = {
        ...processBookingData(body),
        createdBy: userId,
      };

      const created = await db.transaction(async (tx) => {
        const createBlockedDate = (
          await tx
            .insert(BlockedDatesTable)
            .values(format)
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "create",
            tableName: "BLOCKED_DATES",
            recordId: createBlockedDate.blockedDatesId,
            data: JSON.stringify(createBlockedDate),
            remarks: "Blocked Dates created",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return createBlockedDate;
      });

      return c.json(BlockedDatesDTO.parse(created), 201);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

blockedRoutes.openapi(
  createRoute({
    tags: ["Blocked Dates"],
    summary: "Update Blocked Dates by ID",
    method: "patch",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce
          .number()
          .int()
          .openapi({ description: "Blocked Dates ID" }),
      }),
      body: {
        description: "Update Blocked dates",
        required: true,
        content: {
          "application/json": {
            schema: UpdateBlockedDatesDTO,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Blocked dates updated",
        content: {
          "application/json": {
            schema: BlockedDatesDTO,
          },
        },
      },
      404: {
        description: "Blocked Dates not found",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "BLOCKED_DATES",
        "update"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update Blocked Dates.");
      }

      const { id } = c.req.valid("param");
      const body = await c.req.json();
      const { category, others } = body;

      const existing = await db.query.BlockedDatesTable.findFirst({
        where: eq(BlockedDatesTable.blockedDatesId, id),
      });

      if (!existing) {
        throw new NotFoundError("Blocked Dates not found.");
      }

      if (category === "others" && (!others || others.trim() === "")) {
        throw new BadRequestError(
          "Others reason is required for 'others' category"
        );
      }

      const updates = UpdateBlockedDatesDTO.parse(await c.req.json());

      const processedData = processBookingData(updates);

      const created = await db.transaction(async (tx) => {
        const updateBlockedDate = (
          await tx
            .update(BlockedDatesTable)
            .set(processedData)
            .where(eq(BlockedDatesTable.blockedDatesId, id))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "create",
            tableName: "BLOCKED_DATES",
            recordId: updateBlockedDate.blockedDatesId,
            data: JSON.stringify(updateBlockedDate),
            remarks: "Blocked Dates updated",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return updateBlockedDate;
      });

      return c.json(BlockedDatesDTO.parse(created));
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

blockedRoutes.openapi(
  createRoute({
    tags: ["Blocked Dates"],
    summary: "Delete Blocked Dates by ID",
    method: "delete",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce
          .number()
          .int()
          .openapi({ description: "Blocked Dates ID" }),
      }),
    },
    responses: {
      200: {
        description: "Blocked Dates deleted",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Blocked Dates not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "BLOCKED_DATES",
        "delete"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to delete Blocked Dates.");
      }

      const { id } = c.req.valid("param");

      const deleteBlockedDates = await db.query.BlockedDatesTable.findFirst({
        where: eq(BlockedDatesTable.blockedDatesId, id),
      });

      if (!deleteBlockedDates) {
        throw new NotFoundError("Rate not found.");
      }

      await db.transaction(async (tx) => {
        await tx
          .delete(BlockedDatesTable)
          .where(eq(BlockedDatesTable.blockedDatesId, id))
          .execute();

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "delete",
            tableName: "BLOCKED_DATES",
            recordId: id,
            data: JSON.stringify(deleteBlockedDates),
            remarks: "Blocked Dates deleted",
            createdAt: new Date().toISOString(),
          })
          .execute();
      });

      return c.json({
        status: "success",
        message: "Blocked Dates deleted successfully",
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default blockedRoutes;
