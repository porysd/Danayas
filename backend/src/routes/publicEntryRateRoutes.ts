import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { PublicEntryRateTable } from "../schemas/PublicEntryRate";
import {
  PublicEntryRateDTO,
  CreatePublicEntryRateDTO,
  UpdatePublicEntryRateDTO,
} from "../dto/publicEntryRateDTO";
import { eq, and, ne, desc } from "drizzle-orm";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";

const publicEntryRateRoutes = new OpenAPIHono<AuthContext>();

publicEntryRateRoutes.use("/*", authMiddleware);

// Get all public entry rates
publicEntryRateRoutes.openapi(
  createRoute({
    tags: ["Rates"],
    summary: "Get all public entry rate",
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
            schema: PublicEntryRateDTO.array(),
          },
        },
        description: "Retrieve all public entries",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "No public entry found",
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
        "PUBLIC_ENTRY_RATE",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get rate.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const publics = await db.query.PublicEntryRateTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allPublic = publics.map((publicEntryRate) => {
        try {
          return PublicEntryRateDTO.parse(publicEntryRate);
        } catch (e) {
          throw new BadRequestError("Invalid public rate data format");
        }
      });
      return c.json({
        total: publics.length,
        items: allPublic,
      });
    } catch (e) {
      return errorHandler(e, c);
    }
  }
);

// Retrieve public entry rate by ID
publicEntryRateRoutes.openapi(
  createRoute({
    tags: ["Rates"],
    summary: "Retrieve Public Entry Rate by ID",
    method: "get",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce.number().openapi({ description: "Public Entry ID" }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: PublicEntryRateDTO,
          },
        },
        description: "Retrieve the public entry by ID",
      },
      400: {
        description: "Public Entry not found",
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
        "PUBLIC_ENTRY_RATE",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get rate.");
      }

      const { id } = c.req.valid("param");
      const publics = await db.query.PublicEntryRateTable.findFirst({
        where: eq(PublicEntryRateTable.rateId, id),
      });

      if (!publics) {
        throw new NotFoundError("Booking not found.");
      }

      return c.json(PublicEntryRateDTO.parse(publics));
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

// Create Public Entry Rate
publicEntryRateRoutes.openapi(
  createRoute({
    tags: ["Rates"],
    summary: "Create Public Entry Rate",
    method: "post",
    path: "/",
    request: {
      body: {
        description: "Public Entry credentials",
        required: true,
        content: {
          "application/json": {
            schema: CreatePublicEntryRateDTO,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: PublicEntryRateDTO,
          },
        },
        description: "Public Entry created successfully",
      },
      400: {
        description: "Invalid public entry data",
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
        "PUBLIC_ENTRY_RATE",
        "create"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create rate.");
      }

      const body = await c.req.json();

      if (body.isActive) {
        await db
          .update(PublicEntryRateTable)
          .set({ isActive: false })
          .where(
            and(
              eq(PublicEntryRateTable.category, body.category),
              eq(PublicEntryRateTable.mode, body.mode),
              eq(PublicEntryRateTable.isActive, true)
            )
          )
          .execute();
      }

      const parsed = CreatePublicEntryRateDTO.parse(await c.req.json());

      const created = (
        await db
          .insert(PublicEntryRateTable)
          .values(parsed)
          .returning()
          .execute()
      )[0];

      return c.json(PublicEntryRateDTO.parse(created), 201);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

// Update Public Entry Rate by ID
publicEntryRateRoutes.openapi(
  createRoute({
    tags: ["Rates"],
    summary: "Update Public Entry Rate by ID",
    method: "patch",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce.number().int().openapi({ description: "Rate ID" }),
      }),
      body: {
        description: "Update Rate",
        required: true,
        content: {
          "application/json": {
            schema: UpdatePublicEntryRateDTO,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Rate updated",
        content: {
          "application/json": {
            schema: PublicEntryRateDTO,
          },
        },
      },
      404: {
        description: "Rate not found",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PUBLIC_ENTRY_RATE",
        "update"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update rate.");
      }

      const { id } = c.req.valid("param");
      const body = await c.req.json();

      const existingRate = await db.query.PublicEntryRateTable.findFirst({
        where: eq(PublicEntryRateTable.rateId, id),
      });

      if (!existingRate) {
        throw new NotFoundError("Rate not found.");
      }

      // If setting a rate to active, deactivate other active rates for same category and mode
      if (body.isActive === true) {
        await db
          .update(PublicEntryRateTable)
          .set({ isActive: false })
          .where(
            and(
              eq(PublicEntryRateTable.category, existingRate.category),
              eq(PublicEntryRateTable.mode, existingRate.mode),
              eq(PublicEntryRateTable.isActive, true),
              ne(PublicEntryRateTable.rateId, id)
            )
          )
          .execute();
      }

      // Handle deactivation + fallback
      if (body.isActive === false && existingRate.isActive) {
        // Deactivate current rate explicitly (optional if update below does it)
        await db
          .update(PublicEntryRateTable)
          .set({ isActive: false })
          .where(eq(PublicEntryRateTable.rateId, id))
          .execute();

        // Find fallback rate (inactive ones except this)
        const fallback = await db.query.PublicEntryRateTable.findFirst({
          where: and(
            eq(PublicEntryRateTable.category, existingRate.category),
            eq(PublicEntryRateTable.mode, existingRate.mode),
            eq(PublicEntryRateTable.isActive, false),
            ne(PublicEntryRateTable.rateId, id)
          ),
          orderBy: desc(PublicEntryRateTable.createdAt), // or any order you prefer
        });

        // Activate fallback if found
        if (fallback) {
          await db
            .update(PublicEntryRateTable)
            .set({ isActive: true })
            .where(eq(PublicEntryRateTable.rateId, fallback.rateId))
            .execute();
        }
      }

      const updates = UpdatePublicEntryRateDTO.parse(await c.req.json());

      await db
        .update(PublicEntryRateTable)
        .set(updates)
        .where(eq(PublicEntryRateTable.rateId, id))
        .execute();

      const updatedRate = await db.query.PublicEntryRateTable.findFirst({
        where: eq(PublicEntryRateTable.rateId, id),
      });

      return c.json(PublicEntryRateDTO.parse(updatedRate));
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

// Delete Public Entry Rate by ID
publicEntryRateRoutes.openapi(
  createRoute({
    tags: ["Rates"],
    summary: "Delete Public Entry Rate by ID",
    method: "delete",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce.number().int().openapi({ description: "Rate ID" }),
      }),
    },
    responses: {
      200: {
        description: "Rate deleted",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Rate not found",
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
        "PUBLIC_ENTRY_RATE",
        "delete"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to delete rate.");
      }

      const { id } = c.req.valid("param");

      const deletedRate = await db.query.PublicEntryRateTable.findFirst({
        where: eq(PublicEntryRateTable.rateId, id),
      });

      if (!deletedRate) {
        throw new NotFoundError("Rate not found.");
      }

      // If the rate is active, find fallback rate and activate it
      if (deletedRate.isActive) {
        const fallbackRate = await db.query.PublicEntryRateTable.findFirst({
          where: and(
            eq(PublicEntryRateTable.mode, deletedRate.mode),
            eq(PublicEntryRateTable.category, deletedRate.category),
            ne(PublicEntryRateTable.rateId, id)
          ),
          orderBy: desc(PublicEntryRateTable.createdAt),
        });

        if (fallbackRate) {
          await db
            .update(PublicEntryRateTable)
            .set({ isActive: true })
            .where(eq(PublicEntryRateTable.rateId, fallbackRate.rateId))
            .execute();
        }
      }

      await db
        .delete(PublicEntryRateTable)
        .where(eq(PublicEntryRateTable.rateId, id))
        .execute();

      return c.json({
        status: "success",
        message: "Rate deleted successfully",
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default publicEntryRateRoutes;
