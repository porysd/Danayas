//     .get('/booking/addons', getBookingAddOn)
//     .post('/booking/addons', createBookingAddOn)
//     .get('/booking/addons/:id', getBookingAddOnById)
//     .put('/booking/addons/:id', updateBookingAddOn)
//     .delete('/booking/addons/:id', deleteBookingAddON);

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { CatalogAddOnsTable } from "../schemas/CatalogAddOns";
import {
    CatalogAddOnDTO,
  CreateCatalogAddOnDTO,
  UpdateCatalogAddOnDTO,
} from "../dto/catalogAddOnDTO";
import { eq } from "drizzle-orm";

export default new OpenAPIHono()
  .openapi(
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
        400: { description: "Bad request!" },
        500: { description: "Internal server error" },
      },
    }),
    async (c) => {
      const { limit, page } = c.req.valid("query");

      const catalogAddOns = await db.query.CatalogAddOnsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allDiscounts = catalogAddOns.map((catalogAddOn) =>
        CatalogAddOnDTO.parse(catalogAddOn)
      );

      return c.json({
        total: catalogAddOns.length,
        items: allDiscounts,
      });
    }
  )
  .openapi(
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
        404: { description: "Catalog Add-On not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const catalogAddOn = await db.query.CatalogAddOnsTable.findFirst({
        where: eq(CatalogAddOnsTable.catalogAddOnId, id),
      });
      if (!catalogAddOn) return c.json({ error: "Catalog Add-On not found" }, 404);
      return c.json(CatalogAddOnDTO.parse(catalogAddOn));
    }
  )
  .openapi(
    createRoute({
      tags: ["Catalog Add-Ons"],
      summary: "Create Catalog Add-On",
      method: "post",
      path: "/",
      request: {
        body: {
          required: true,
          content: {
            "application/json": {
              schema: CreateCatalogAddOnDTO,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Catalog Add-On created",
          content: {
            "application/json": {
              schema: CatalogAddOnDTO,
            },
          },
        },
      },
    }),
    async (c) => {
      const parsed = CreateCatalogAddOnDTO.parse(await c.req.json());
      const created = (await db.insert(CatalogAddOnsTable).values(parsed).returning().execute())[0];
      return c.json(CatalogAddOnDTO.parse(created));
    }
  )
  .openapi(
    createRoute({
      tags: ["Catalog Add-Ons"],
      summary: "Update Catalog Add-On by ID",
      method: "patch",
      path: "/:id",
      request: {
        params: z.object({
          id: z.coerce.number().int().openapi({ description: "Catalog Add-On ID" }),
        }),
        body: {
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
        404: { description: "Catalog Add-On not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const updates = UpdateCatalogAddOnDTO.parse(await c.req.json());

      await db.update(CatalogAddOnsTable).set(updates).where(eq(CatalogAddOnsTable.catalogAddOnId, id)).execute();
      const updated = await db.query.CatalogAddOnsTable.findFirst({ where: eq(CatalogAddOnsTable.catalogAddOnId, id) });

      if (!updated) return c.json({ error: "Catalog Add-On not found" }, 404);
      return c.json(CatalogAddOnDTO.parse(updated));
    }
  )
  // TODO: check if catalogaddonid exist first
  .openapi(
    createRoute({
      tags: ["Catalog Add-Ons"],
      summary: "Delete catalogAddOn by ID",
      method: "delete",
      path: "/:id",
      request: {
        params: z.object({
          id: z.coerce.number().int().openapi({ description: "Catalog Add-On ID" }),
        }),
      },
      responses: {
        200: { description: "Catalog Add-On deleted" },
        404: { description: "Catalog Add-On not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      await db.delete(CatalogAddOnsTable).where(eq(CatalogAddOnsTable.catalogAddOnId, id)).execute();
      return c.text("Catalog Add-On deleted!");
    }
  );