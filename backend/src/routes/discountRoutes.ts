import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { DiscountsTable } from "../schemas/Discounts";
import {
  DiscountDTO,
  CreateDiscountDTO,
  UpdateDiscountDTO,
} from "../dto/discountDTO";
import { eq } from "drizzle-orm";

export default new OpenAPIHono()
  .openapi(
    createRoute({
      tags: ["Discounts"],
      summary: "Get all discount",
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
              schema: DiscountDTO.array(),
            },
          },
          description: "Retrieve all discounts",
        },
        400: { description: "Bad request!" },
        500: { description: "Internal server error" },
      },
    }),
    async (c) => {
      const { limit, page } = c.req.valid("query");

      const discounts = await db.query.DiscountsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allDiscounts = discounts.map((discount) =>
        DiscountDTO.parse(discount)
      );

      return c.json({
        total: discounts.length,
        items: allDiscounts,
      });
    }
  )
  .openapi(
    createRoute({
      tags: ["Discounts"],
      summary: "Get discount by ID",
      method: "get",
      path: "/:id",
      request: {
        params: z.object({
          id: z.coerce.number().int().openapi({ description: "Discount ID" }),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: DiscountDTO,
            },
          },
          description: "Discount found",
        },
        404: { description: "Discount not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const discount = await db.query.DiscountsTable.findFirst({
        where: eq(DiscountsTable.discountId, id),
      });
      if (!discount) return c.json({ error: "Discount not found" }, 404);
      return c.json(DiscountDTO.parse(discount));
    }
  )
  .openapi(
    createRoute({
      tags: ["Discounts"],
      summary: "Create discount",
      method: "post",
      path: "/",
      request: {
        body: {
          required: true,
          content: {
            "application/json": {
              schema: CreateDiscountDTO,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Discount created",
          content: {
            "application/json": {
              schema: DiscountDTO,
            },
          },
        },
      },
    }),
    async (c) => {
      const parsed = CreateDiscountDTO.parse(await c.req.json());
      const created = (
        await db.insert(DiscountsTable).values(parsed).returning().execute()
      )[0];
      return c.json(DiscountDTO.parse(created));
    }
  )
  .openapi(
    createRoute({
      tags: ["Discounts"],
      summary: "Update discount by ID",
      method: "patch",
      path: "/:id",
      request: {
        params: z.object({
          id: z.coerce.number().int().openapi({ description: "Discount ID" }),
        }),
        body: {
          required: true,
          content: {
            "application/json": {
              schema: UpdateDiscountDTO,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Discount updated",
          content: {
            "application/json": {
              schema: DiscountDTO,
            },
          },
        },
        404: { description: "Discount not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const updates = UpdateDiscountDTO.parse(await c.req.json());

      await db
        .update(DiscountsTable)
        .set(updates)
        .where(eq(DiscountsTable.discountId, id))
        .execute();
      const updated = await db.query.DiscountsTable.findFirst({
        where: eq(DiscountsTable.discountId, id),
      });

      if (!updated) return c.json({ error: "Discount not found" }, 404);
      return c.json(DiscountDTO.parse(updated));
    }
  )
  // TODO: check if discountid exist first
  .openapi(
    createRoute({
      tags: ["Discounts"],
      summary: "Delete discount by ID",
      method: "delete",
      path: "/:id",
      request: {
        params: z.object({
          id: z.coerce.number().int().openapi({ description: "Discount ID" }),
        }),
      },
      responses: {
        200: { description: "Discount deleted" },
        404: { description: "Discount not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      await db
        .delete(DiscountsTable)
        .where(eq(DiscountsTable.discountId, id))
        .execute();
      return c.text("Discount deleted!");
    }
  );
