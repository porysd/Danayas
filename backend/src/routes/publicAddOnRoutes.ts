import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { PublicEntryAddOnsTable } from "../schemas/PublicAddOns";
import {
  PublicEntryAddOnDTO,
  CreatePublicEntryAddOnDTO,
  UpdatePublicEntryAddOnDTO,
} from "../dto/publicAddOnDTO";
import { eq } from "drizzle-orm";
import { PublicEntryTable } from "../schemas/PublicEntry";
import { CatalogAddOnsTable } from "../schemas/CatalogAddOns";
import { errorHandler } from "../middlewares/errorHandler";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { CatalogAddOnDTO } from "../dto/catalogAddOnDTO";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";
import { AuditLogsTable } from "../schemas/schema";

const publicAddOnRoutes = new OpenAPIHono<AuthContext>();

publicAddOnRoutes.use("/*", authMiddleware);

publicAddOnRoutes.openapi(
  createRoute({
    tags: ["Public Add-Ons"],
    summary: "Get all public add-ons",
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
            schema: PublicEntryAddOnDTO.array(),
          },
        },
        description: "Retrieve all public add-ons",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Public add-ons not found",
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
        "PUBLIC_ENTRY_ADD_ONS",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get public.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const publicAddOns = await db.query.PublicEntryAddOnsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allPublicAddOns = publicAddOns.map((publicAddOn) => {
        try {
          return PublicEntryAddOnDTO.parse(publicAddOn);
        } catch (err) {
          throw new BadRequestError("Invalid booking add-on data.");
        }
      });

      return c.json({
        total: publicAddOns.length,
        items: allPublicAddOns,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

publicAddOnRoutes.openapi(
  createRoute({
    tags: ["Public Add-Ons"],
    summary: "Create a new public add-on",
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
        description: "Public add-on data",
        required: true,
        content: {
          "application/json": {
            schema: CreatePublicEntryAddOnDTO,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Public add-on created successfully",
        content: {
          "application/json": {
            schema: PublicEntryAddOnDTO,
          },
        },
      },
      400: {
        description: "Invalid public add-on data",
      },
      404: {
        description: "Public or catalog add-on not found",
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
        "BOOKING_ADD_ONS",
        "create"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create booking add-on.");
      }

      const parsed = CreatePublicEntryAddOnDTO.parse(await c.req.json());
      const { publicEntryId, catalogAddOnId } = parsed;

      const selectedPublic = await db.query.PublicEntryTable.findFirst({
        where: eq(PublicEntryTable.publicEntryId, publicEntryId),
      });

      if (!selectedPublic) {
        throw new NotFoundError("Public not found.");
      }

      const selectedCatalogAddOn = await db.query.CatalogAddOnsTable.findFirst({
        where: eq(CatalogAddOnsTable.catalogAddOnId, catalogAddOnId),
      });

      if (!selectedCatalogAddOn) {
        throw new NotFoundError("Catalog add-on not found.");
      }

      const price = selectedCatalogAddOn.price;

      const created = await db.transaction(async (tx) => {
        const createPublicEntryAddOn = (
          await tx
            .insert(PublicEntryAddOnsTable)
            .values({
              ...parsed,
              price: price,
            })
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "create",
            tableName: "PUBLIC_ENTRY_ADD_ONS",
            recordId: createPublicEntryAddOn.publicAddOnId,
            data: JSON.stringify(createPublicEntryAddOn),
            remarks: "Public add-on created",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return createPublicEntryAddOn;
      });

      return c.json(PublicEntryAddOnDTO.parse(created), 201);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default publicAddOnRoutes;
