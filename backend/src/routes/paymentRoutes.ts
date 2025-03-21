import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { PaymentDTO, CreatePaymentDTO, UpdatePaymentDTO } from "../dto/paymentDTO";
import db from "../config/database";
import { PaymentsTable } from "../schemas/schema";
import { eq, like, or } from "drizzle-orm";

export default new OpenAPIHono()
  .openapi(
    createRoute({
      tags: ["Payments"],
      method: "get",
      path: "/",
      request: {
        query: z.object({
          limit: z.coerce.number().nonnegative().openapi({
            example: 50,
            description: "Limit that the server will give",
          }),
          page: z.coerce
            .number()
            .nonnegative()
            .openapi({ example: 0, description: "Page to get" }),
        }),
      },
      summary: "Retrieve all the payments",
      responses: {
        200: {
          // content: {
          //   "application/json": {
          //     schema: PaymentDTO.array(),
          //   },
          // },
          description: "Retrieved all the payments",
        },
      },
    }),
    async (c) => {
      const { limit, page } = c.req.valid("query");

      const payments = await db.query.PaymentsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });
      return c.json({
        total: payments.length,
        items: payments,
      });
    }
  )
  .openapi(
    createRoute({
      tags: ["Payments"],
      summary: "Get Payment By ID",
      method: "get",
      path: "/:id",
      request: {
        params: z.object({
          id: z.coerce.number().openapi({ description: "Id to find" }),
        }),
      },
      responses: {
        200: {
          description: "Successful payment retrieval",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");

      const dbPayment = await db.query.PaymentsTable.findFirst({
        where: eq(PaymentsTable.paymentId, id),
      });

      if (!dbPayment) return c.json({ error: "Package not found" }, 404);

      return c.json(dbPayment);
    }
  )
  .openapi(
    createRoute({
      tags: ["Payments"],
      summary: "Create Payments",
      method: "post",
      path: "/",
      request: {
        body: {
          content: {
            "application/json": {
              schema: CreatePaymentDTO,
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: PaymentDTO,
            },
          },
          description: "Successful payment creation",
        },
      },
    }),
    async (c) => {
      const body = c.req.valid("json");

      const dbPackage = (
        await db.insert(PaymentsTable).values(body).returning().execute()
      )[0];

      return c.json(dbPackage);
    }
  )
  .openapi(
    createRoute({
      tags: ["Payments"],
      method: "patch",
      path: "/:id",
      summary: "Update the payment by ID",
      request: {
        body: {
          description: "Update Payment",
          required: true,
          content: {
            "application/json": { schema: UpdatePaymentDTO },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: PaymentDTO,
            },
          },
          description: "User Updated",
        },
        400: {
          description: "Invalid user ID",
        },
      },
    }),
    async (c) => {
      const userId = Number(c.req.param("id"));

      const updatedPayment = (await db
        .update(PaymentsTable)
        .set(UpdatePaymentDTO.parse(await c.req.json()))
        .where(eq(PaymentsTable.paymentId, userId))
        .returning().execute())[0];
      return c.json(updatedPayment);
    }
  );
