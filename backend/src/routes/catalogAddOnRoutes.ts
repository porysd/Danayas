import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { CatalogAddOnsTable } from "../schemas/CatalogAddOns";
import {
  CatalogAddOnDTO,
  CreateCatalogAddOnDTO,
  UpdateCatalogAddOnDTO,
} from "../dto/catalogAddOnDTO";
import { eq } from "drizzle-orm";
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

const catalogAddOnRoutes = new OpenAPIHono<AuthContext>();

catalogAddOnRoutes.use("/*", authMiddleware);

catalogAddOnRoutes.openapi(
  createRoute({
    tags: ["Catalog Add-Ons"],
    summary: "Get all catalog add-ons",
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
            schema: CatalogAddOnDTO.array(),
          },
        },
        description: "Retrieve all catalog add-ons",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Catalog add-ons not found",
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
        "CATALOG_ADD_ONS",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get catalog add-ons.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const catalogAddOns = await db.query.CatalogAddOnsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allCatalogAddOns = catalogAddOns.map((catalogAddOn) => {
        try {
          return CatalogAddOnDTO.parse(catalogAddOn);
        } catch (err) {
          throw new BadRequestError("Invalid Catalog Add-On data.");
        }
      });

      return c.json({
        total: catalogAddOns.length,
        items: allCatalogAddOns,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

catalogAddOnRoutes.openapi(
  createRoute({
    tags: ["Catalog Add-Ons"],
    summary: "Get Catalog Add-On by ID",
    method: "get",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce
          .number()
          .int()
          .openapi({ description: "Catalog Add-On ID" }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: CatalogAddOnDTO,
          },
        },
        description: "Catalog Add-On found",
      },
      404: {
        description: "Catalog Add-On not found",
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
        "CATALOG_ADD_ONS",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get catalog add-on.");
      }

      const { id } = c.req.valid("param");
      const catalogAddOn = await db.query.CatalogAddOnsTable.findFirst({
        where: eq(CatalogAddOnsTable.catalogAddOnId, id),
      });

      if (!catalogAddOn) {
        throw new NotFoundError("Catalog Add-On not found.");
      }

      return c.json(CatalogAddOnDTO.parse(catalogAddOn));
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

catalogAddOnRoutes.openapi(
  createRoute({
    tags: ["Catalog Add-Ons"],
    summary: "Create Catalog Add-On",
    method: "post",
    path: "/",
    request: {
      body: {
        description: "Create Catalog Add-On",
        required: true,
        content: {
          "application/json": {
            schema: CreateCatalogAddOnDTO,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Catalog Add-On created",
        content: {
          "application/json": {
            schema: CatalogAddOnDTO,
          },
        },
      },
      400: {
        description: "Invalid Catalog Add-On data",
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
        "CATALOG_ADD_ONS",
        "create"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create catalog add-on.");
      }

      const parsed = CreateCatalogAddOnDTO.parse(await c.req.json());

      const created = await db.transaction(async (tx) => {
        const createCatalogAddOn = (
          await tx
            .insert(CatalogAddOnsTable)
            .values(parsed)
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "create",
            tableName: "CATALOG_ADD_ONS",
            recordId: createCatalogAddOn.catalogAddOnId,
            data: JSON.stringify(createCatalogAddOn),
            remarks: "Catalog Add-On created",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return createCatalogAddOn;
      });

      return c.json(CatalogAddOnDTO.parse(created), 201);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

catalogAddOnRoutes.openapi(
  createRoute({
    tags: ["Catalog Add-Ons"],
    summary: "Update Catalog Add-On by ID",
    method: "patch",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce
          .number()
          .int()
          .openapi({ description: "Catalog Add-On ID" }),
      }),
      body: {
        description: "Update Catalog Add-On",
        required: true,
        content: {
          "application/json": {
            schema: UpdateCatalogAddOnDTO,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Catalog Add-On updated",
        content: {
          "application/json": {
            schema: CatalogAddOnDTO,
          },
        },
      },
      404: {
        description: "Catalog Add-On not found",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "CATALOG_ADD_ONS",
        "update"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update catalog add-on.");
      }

      const { id } = c.req.valid("param");

      const existingCatalogAddOn = await db.query.CatalogAddOnsTable.findFirst({
        where: eq(CatalogAddOnsTable.catalogAddOnId, id),
      });

      if (!existingCatalogAddOn) {
        throw new NotFoundError("Catalog Add-On not found.");
      }

      const updates = UpdateCatalogAddOnDTO.parse(await c.req.json());

      const updated = await db.transaction(async (tx) => {
        const updatedCatalog = (
          await tx
            .update(CatalogAddOnsTable)
            .set(updates)
            .where(eq(CatalogAddOnsTable.catalogAddOnId, id))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "update",
            tableName: "CATALOG_ADD_ONS",
            recordId: id,
            data: JSON.stringify(updatedCatalog),
            remarks: "Catalog Add-On updated",
            createdAt: new Date().toISOString(),
          })
          .execute();
        return updatedCatalog;
      });

      return c.json(CatalogAddOnDTO.parse(updated));
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

catalogAddOnRoutes.openapi(
  createRoute({
    tags: ["Catalog Add-Ons"],
    summary: "Delete Catalog Add-On by ID",
    method: "delete",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce
          .number()
          .int()
          .openapi({ description: "Catalog Add-On ID" }),
      }),
    },
    responses: {
      200: {
        description: "Catalog Add-On deleted",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Catalog Add-On not found",
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
        "CATALOG_ADD_ONS",
        "delete"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to delete catalog add-on.");
      }

      const { id } = c.req.valid("param");

      const deletedCatalog = await db.query.CatalogAddOnsTable.findFirst({
        where: eq(CatalogAddOnsTable.catalogAddOnId, id),
      });

      if (!deletedCatalog) {
        throw new NotFoundError("Catalog Add-On not found.");
      }

      const deleted = await db.transaction(async (tx) => {

        const deleteCatalogAddOn = await tx
        .delete(CatalogAddOnsTable)
        .where(eq(CatalogAddOnsTable.catalogAddOnId, id))
        .execute();

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "delete",
            tableName: "CATALOG_ADD_ONS",
            recordId: id,
            data: JSON.stringify(deletedCatalog),
            remarks: "Catalog Add-On deleted",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return deleteCatalogAddOn;
      });

      

      return c.json({
        status: "success",
        message: "Catalog Add-On deleted successfully",
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default catalogAddOnRoutes;
