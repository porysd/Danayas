import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  PaymentDTO,
  CreatePaymentDTO,
  UpdatePaymentDTO,
} from "../dto/paymentDTO";
import db from "../config/database";
import { PaymentsTable } from "../schemas/schema";
import { eq, like, or } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";

export default new OpenAPIHono()
  .openapi(
    createRoute({
      tags: ["Payments"],
      summary: "Retrieve all the payments",
      method: "get",
      path: "/",
      request: {
        query: z.object({
          limit: z.coerce.number().nonnegative().openapi({
            example: 10,
            description: "Number of records per page",
          }),
          page: z.coerce.number().nonnegative().openapi({
            example: 1,
            description: "Page number to retrieve",
          }),
        }),
      },
      responses: {
        200: {
          description: "Retrieved all the payments",
          content: {
            "application/json": {
              schema: z.object({
                total: z.number(),
                items: PaymentDTO.array(),
              }),
            },
          },
        },
        400: {
          description: "Invalid request",
        },
        404: {
          description: "No payments found",
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

        const payments = await db.query.PaymentsTable.findMany({
          limit,
          offset: (page - 1) * limit,
        });

        // if (!payments || payments.length === 0) {
        //   throw new NotFoundError("No payments found.");
        // }

        return c.json({
          total: payments.length,
          items: payments,
        });
      } catch (err) {
        return errorHandler(err, c);
      }
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
          content: {
            "application/json": {
              schema: PaymentDTO,
            },
          },
        },
        400: {
          description: "Invalid payment ID",
        },
        404: {
          description: "Payment not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const { id } = c.req.valid("param");

        const dbPayment = await db.query.PaymentsTable.findFirst({
          where: eq(PaymentsTable.paymentId, id),
        });

        if (!dbPayment) {
          throw new NotFoundError("Payment not found");
        }

        return c.json(dbPayment);
      } catch (err) {
        return errorHandler(err, c);
      }
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
        201: {
          content: {
            "application/json": {
              schema: PaymentDTO,
            },
          },
          description: "Successful payment creation",
        },
        400: {
          description: "Invalid payment data",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const body = c.req.valid("json");

        const dbPayment = (
          await db.insert(PaymentsTable).values(body).returning().execute()
        )[0];

        if (!dbPayment) {
          throw new BadRequestError("Failed to create payment.");
        }

        return c.json(PaymentDTO.parse(dbPayment), 201);
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )
  .openapi(
    createRoute({
      tags: ["Payments"],
      summary: "Update Payment by ID",
      method: "patch",
      path: "/:id",
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
          description: "Payment Updated Successfully",
        },
        400: {
          description: "Invalid payment ID",
        },
        404: {
          description: "Payment not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const paymentId = Number(c.req.param("id"));

        if (isNaN(paymentId)) {
          throw new BadRequestError("Invalid payment ID.");
        }

        const dbPayment = UpdatePaymentDTO.parse(await c.req.json());

        const updatedPayment = await db
          .update(PaymentsTable)
          .set(dbPayment)
          .where(eq(PaymentsTable.paymentId, paymentId))
          .returning()
          .execute();

        if (updatedPayment.length === 0) {
          throw new NotFoundError("Payment not found.");
        }

        return c.json(updatedPayment);
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  );
