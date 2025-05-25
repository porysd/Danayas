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
import { AuditLogsTable } from "../schemas/schema";

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
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      query: z.object({
        limit: z.coerce.number().nonnegative().min(1).default(20).openapi({
          example: 50,
          description: "Limit that the server will give",
        }),
        page: z.coerce.number().nonnegative().min(1).default(1).openapi({
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
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
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
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
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
        await db.transaction(async (tx) => {
          const updatePublicEntryRate = (
            await tx
              .update(PublicEntryRateTable)
              .set({ isActive: false })
              .where(
                and(
                  eq(PublicEntryRateTable.category, body.category),
                  eq(PublicEntryRateTable.mode, body.mode),
                  eq(PublicEntryRateTable.isActive, true)
                )
              )
              .returning()
              .execute()
          )[0];

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: userId,
              action: "update",
              tableName: "PUBLIC_ENTRY_RATE",
              recordId: updatePublicEntryRate.rateId,
              data: JSON.stringify(updatePublicEntryRate),
              remarks: "Deactivated previous active rate",
              createdAt: new Date().toISOString(),
            })
            .execute();
        });
      }

      const parsed = CreatePublicEntryRateDTO.parse(await c.req.json());

      const created = await db.transaction(async (tx) => {
        const createPublicEntryRate = (
          await tx
            .insert(PublicEntryRateTable)
            .values(parsed)
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "create",
            tableName: "PUBLIC_ENTRY_RATE",
            recordId: createPublicEntryRate.rateId,
            data: JSON.stringify(createPublicEntryRate),
            remarks: "Public entry rate created",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return createPublicEntryRate;
      });

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
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
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
      const updates = UpdatePublicEntryRateDTO.parse(await c.req.json());

      const existingRate = await db.query.PublicEntryRateTable.findFirst({
        where: eq(PublicEntryRateTable.rateId, id),
      });

      if (!existingRate) {
        throw new NotFoundError("Rate not found.");
      }

      // If setting a rate to active, deactivate other active rates for same category and mode

      const updated = await db.transaction(async (tx) => {
        if (updates.isActive === true) {
          const deactivatePublicEntryRates = await tx
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
            .returning()
            .execute();

          for (const rate of deactivatePublicEntryRates) {
            await tx
              .insert(AuditLogsTable)
              .values({
                userId,
                action: "update",
                tableName: "PUBLIC_ENTRY_RATE",
                recordId: rate.rateId,
                data: JSON.stringify(rate),
                remarks: "Deactivated previous active rate",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
        }

        // Handle deactivation + fallback
        if (updates.isActive === false && existingRate.isActive) {
          // Find fallback rate (inactive ones except this)
          const fallback = await tx.query.PublicEntryRateTable.findFirst({
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
            const updatedFallback = (
              await tx
                .update(PublicEntryRateTable)
                .set({ isActive: true })
                .where(eq(PublicEntryRateTable.rateId, fallback.rateId))
                .returning()
                .execute()
            )[0];

            if (updatedFallback) {
              await tx
                .insert(AuditLogsTable)
                .values({
                  userId,
                  action: "update",
                  tableName: "PUBLIC_ENTRY_RATE",
                  recordId: updatedFallback.rateId,
                  data: JSON.stringify(updatedFallback),
                  remarks: "Activated fallback rate",
                  createdAt: new Date().toISOString(),
                })
                .execute();
            }
          }
        }

        const updatedRate = (
          await tx
            .update(PublicEntryRateTable)
            .set(updates)
            .where(eq(PublicEntryRateTable.rateId, id))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId,
            action: "update",
            tableName: "PUBLIC_ENTRY_RATE",
            recordId: id,
            data: JSON.stringify(updatedRate),
            remarks: "Public entry rate updated",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return updatedRate;
      });

      return c.json(PublicEntryRateDTO.parse(updated));
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
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
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
      const deleted = await db.transaction(async (tx) => {
        // If the rate is active, find fallback rate and activate it
        if (deletedRate.isActive) {
          const fallbackRate = await tx.query.PublicEntryRateTable.findFirst({
            where: and(
              eq(PublicEntryRateTable.mode, deletedRate.mode),
              eq(PublicEntryRateTable.category, deletedRate.category),
              ne(PublicEntryRateTable.rateId, id)
            ),
            orderBy: desc(PublicEntryRateTable.createdAt),
          });

          if (fallbackRate) {
            const updatedPublicEntryRate = (
              await tx
                .update(PublicEntryRateTable)
                .set({ isActive: true })
                .where(eq(PublicEntryRateTable.rateId, fallbackRate.rateId))
                .returning()
                .execute()
            )[0];

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "PUBLIC_ENTRY_RATE",
                recordId: updatedPublicEntryRate.rateId,
                data: JSON.stringify(updatedPublicEntryRate),
                remarks: "Activated fallback rate after deletion",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
        }

        const deletePublicEntryRate = (
          await tx
            .delete(PublicEntryRateTable)
            .where(eq(PublicEntryRateTable.rateId, id))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "delete",
            tableName: "PUBLIC_ENTRY_RATE",
            recordId: deletePublicEntryRate.rateId,
            data: JSON.stringify(deletePublicEntryRate),
            remarks: "Public entry rate deleted",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return deletePublicEntryRate;
      });

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
