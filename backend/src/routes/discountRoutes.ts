import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { DiscountsTable } from "../schemas/Discounts";
import {
  DiscountDTO,
  CreateDiscountDTO,
  UpdateDiscountDTO,
} from "../dto/discountDTO";
import { eq } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";

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
        400: {
          description: "Invalid request",
        },
        404: {
          description: "No discount found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const { limit, page } = c.req.valid("query");

        if (limit < 1 || page < 1) {
          throw new BadRequestError("Limit and page must be greater than 0.");
        }

        const discounts = await db.query.DiscountsTable.findMany({
          limit,
          offset: (page - 1) * limit,
        });

        const allDiscounts = discounts.map((discount) => {
          try {
            return DiscountDTO.parse(discount);
          } catch (err) {
            throw new BadRequestError("Invalid discount data format.");
          }
        });

        return c.json({
          total: discounts.length,
          items: allDiscounts,
        });
      } catch (err) {
        return errorHandler(err, c);
      }
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
          description: "Successful discount retrieval",
          content: {
            "application/json": {
              schema: DiscountDTO,
            },
          },
        },
        400: {
          description: "Invalid discount ID",
        },
        404: {
          description: "Discount not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const { id } = c.req.valid("param");

        const discount = await db.query.DiscountsTable.findFirst({
          where: eq(DiscountsTable.discountId, id),
        });

        if (!discount) {
          throw new NotFoundError("Discount not found");
        }

        return c.json(DiscountDTO.parse(discount));
      } catch (err) {
        return errorHandler(err, c);
      }
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
        201: {
          description: "Discount created",
          content: {
            "application/json": {
              schema: DiscountDTO,
            },
          },
        },
        400: {
          description: "Invalid discount data",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const parsed = CreateDiscountDTO.parse(await c.req.json());

        const created = (
          await db.insert(DiscountsTable).values(parsed).returning().execute()
        )[0];

        if (!created) {
          throw new BadRequestError("Failed to create discount.");
        }

        return c.json(DiscountDTO.parse(created));
      } catch (err) {
        return errorHandler(err, c);
      }
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
          description: "Update discount",
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
        400: {
          description: "Invalid discount ID",
        },
        404: {
          description: "Discount not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
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

        if (!updated) {
          throw new NotFoundError("Discount not found.");
        }

        return c.json(DiscountDTO.parse(updated));
      } catch (err) {
        return errorHandler(err, c);
      }
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
        200: {
          description: "Discount deleted",
        },
        404: {
          description: "Discount not found",
        },
      },
    }),
    async (c) => {
      try {
        const { id } = c.req.valid("param");

        const deletedDiscount = await db.query.DiscountsTable.findFirst({
          where: eq(DiscountsTable.discountId, id),
        });

        if (!deletedDiscount) {
          throw new NotFoundError("Booking not found.");
        }

        await db
          .delete(DiscountsTable)
          .where(eq(DiscountsTable.discountId, id))
          .execute();

        return c.json({
          status: "success",
          message: "Discount deleted successfully.",
        });
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  );
