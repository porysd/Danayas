import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  PaymentDTO,
  CreatePaymentDTO,
  UpdatePaymentDTO,
  RefundPaymentDTO,
} from "../dto/paymentDTO";
import db from "../config/database";
import {
  BookingsTable,
  PaymentsTable,
  TransactionsTable,
} from "../schemas/schema";
import { desc, and, ne, eq, like, or } from "drizzle-orm";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";

const paymentRoutes = new OpenAPIHono<AuthContext>();

paymentRoutes.use("/*", authMiddleware);

paymentRoutes.openapi(
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
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PAYMENT", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get payments.");
      }

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
);

paymentRoutes.openapi(
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
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PAYMENT", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get payment.");
      }

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
);

paymentRoutes.openapi(
  createRoute({
    tags: ["Payments"],
    summary: "Refund Payment",
    method: "post",
    path: "/refund",
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
        description: "Successful refund creation",
      },
      400: {
        description: "Invalid refund data",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PAYMENT", "create");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create payment.");
      }

      const parsed = RefundPaymentDTO.parse(await c.req.json());
      const { transactionId, mode } = parsed;

      // Select the transactionId by transactionId
      const transaction = await db.query.TransactionsTable.findFirst({
        where: eq(TransactionsTable.transactionId, transactionId),
      });
      if (!transaction) {
        throw new NotFoundError("Transaction not found.");
      }

      // Select the booking by bookingId
      const booking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, transaction.bookingId),
      });

      //TODO: ONLY ALLOW REFUND ONCE

      if (!booking) {
        throw new NotFoundError("Booking not found.");
      }

      if (booking.bookStatus === "completed") {
        return c.json(
          { error: "Cannot refund payment for this booking status" },
          400
        );
      }

      // Gets the remaining balance from the transaction
      const remainingBalance = transaction.remainingBalance;

      // Check if latest payment is existing
      const latestPayment = await db.query.PaymentsTable.findFirst({
        where: eq(PaymentsTable.transactionId, transactionId),
        orderBy: [desc(PaymentsTable.paidAt)],
      });

      const allValidPayments = await db.query.PaymentsTable.findMany({
        where: and(
          eq(PaymentsTable.transactionId, transactionId),
          ne(PaymentsTable.paymentStatus, "voided")
        ),
      });


      if (!allValidPayments.length) {
        return c.json(
          { error: "No valid previous payments found for this transaction" },
          400
        );
      }

      // If latest payment exists, check its status
      if (!latestPayment) {
        return c.json(
          { error: "No previous payment found for this transaction" },
          400
        );
      }

      // Check if the latest payment is voided
      if (latestPayment.paymentStatus === "voided") {
        return c.json(
          { error: "Cannot proceed, latest payment is voided" },
          400
        );
      }

      const totalPaid = allValidPayments.reduce((sum, payment) => {
        return sum + payment.amountPaid;
      }, 0);

      const refundRate = 0.5;
      const refundAmount = totalPaid * refundRate;

      // refund through cash
      if (mode === "cash") {
        const created = await db
          .insert(PaymentsTable)
          .values({
            ...parsed,
            amountPaid: refundAmount,
            category: "refund",
          })
          .returning();
        await db
          .update(TransactionsTable)
          .set({
            remainingBalance: remainingBalance + refundAmount,
            refundStatus: "refunded",
          })
          .where(eq(TransactionsTable.transactionId, transactionId))
          .execute();
        await db
          .update(BookingsTable)
          .set({
            bookStatus: "cancelled",
          })
          .where(eq(BookingsTable.bookingId, booking.bookingId))
          .execute();

        return c.json(PaymentDTO.parse(created[0]), 201);
      }
      // refund through gcash
      else {
        if (!parsed.reference || !parsed.imageUrl) {
          return c.json(
            {
              error: "Reference and imageUrl are required for online payments",
            },
            400
          );
        }
        const created = await db
          .insert(PaymentsTable)
          .values({
            ...parsed,
            amountPaid: refundAmount, // Negative amount for refund
            category: "refund",
          })
          .returning();
        await db
          .update(TransactionsTable)
          .set({
            remainingBalance: remainingBalance + refundAmount,
            refundStatus: "refunded",
          })
          .where(eq(TransactionsTable.transactionId, transactionId))
          .execute();
        await db
          .update(BookingsTable)
          .set({
            bookStatus: "cancelled",
          })
          .where(eq(BookingsTable.bookingId, booking.bookingId))
          .execute();

        return c.json(PaymentDTO.parse(created[0]), 201);
      }
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

paymentRoutes.openapi(
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
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PAYMENT", "create");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create payments.");
      }

      const parsed = CreatePaymentDTO.parse(await c.req.json());
      const { transactionId, mode } = parsed;

      // Select the transactionId by transactionId
      const transaction = await db.query.TransactionsTable.findFirst({
        where: eq(TransactionsTable.transactionId, transactionId),
      });

      if (!transaction) {
        throw new NotFoundError("Transaction not found.");
      }

      // Select the booking by transactionId
      const booking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, transaction.bookingId),
      });

      if (!booking) {
        throw new NotFoundError("Booking not found.");
      }

      if (
        booking.bookStatus === "cancelled" ||
        booking.bookStatus === "completed"
      ) {
        return c.json(
          { error: "Cannot create payment for this booking status" },
          400
        );
      }
      // Gets the remaining balance from the transaction
      const remainingBalance = transaction.remainingBalance;

      // Check if latest payment is existing through transactionId
      const latestPayment = await db.query.PaymentsTable.findFirst({
        where: eq(PaymentsTable.transactionId, transactionId),
        orderBy: [desc(PaymentsTable.paidAt)],
      });
      // If latest payment exists
      if (latestPayment) {
        // Check if the transaction status is voided
        if (transaction.transactionStatus === "voided") {
          return c.json(
            { error: "Cannot proceed, latest payment is voided" },
            400
          );
        }
        // Check if the transaction status is already paid
        if (transaction.transactionStatus === "paid") {
          return c.json({ error: "Booking already paid" }, 400);
        }

        // Get the remainingBalance of the latest payment to amountPaid
        const amountPaid = remainingBalance;

        if (mode === "gcash") {
          if (!parsed.reference || !parsed.imageUrl) {
            return c.json(
              {
                error:
                  "Reference and imageUrl are required for online payments",
              },
              400
            );
          }
          const created = await db
            .insert(PaymentsTable)
            .values({
              ...parsed,
              category: "payment",
              amountPaid: amountPaid,
            })
            .returning();
          await db
            .update(TransactionsTable)
            .set({
              remainingBalance: remainingBalance - amountPaid,
              transactionStatus: "paid",
            })
            .where(eq(TransactionsTable.transactionId, transactionId))
            .execute();
          return c.json(PaymentDTO.parse(created[0]), 201);
        } else {
          const created = await db
            .insert(PaymentsTable)
            .values({
              ...parsed,
              category: "payment",
              amountPaid: amountPaid,
            })
            .returning();
          await db
            .update(TransactionsTable)
            .set({
              remainingBalance: remainingBalance - amountPaid,
              transactionStatus: "paid",
            })
            .where(eq(TransactionsTable.transactionId, transactionId))
            .execute();

          return c.json(PaymentDTO.parse(created[0]), 201);
        }
      } else {
        // If no previous payment exists, create a new payment record
        const paymentTerms = booking.paymentTerms;
        if (paymentTerms === "installment") {
          // if gcash, reference and imageUrl is required
          if (mode === "gcash") {
            if (!parsed.reference || !parsed.imageUrl) {
              return c.json(
                {
                  error:
                    "Reference and imageUrl are required for online payments",
                },
                400
              );
            }

            const created = await db
              .insert(PaymentsTable)
              .values({
                ...parsed,
                downPaymentAmount: 3000,
                amountPaid: 3000,
                category: "payment",
              })
              .returning();
            await db
              .update(TransactionsTable)
              .set({
                remainingBalance: remainingBalance - 3000,
                transactionStatus: "partially-paid",
              })
              .where(eq(TransactionsTable.transactionId, transactionId))
              .execute();
            return c.json(PaymentDTO.parse(created[0]), 201);
          } else {
            const created = await db
              .insert(PaymentsTable)
              .values({
                ...parsed,
                downPaymentAmount: 3000,
                amountPaid: 3000,
                category: "payment",
              })
              .returning();

            await db
              .update(TransactionsTable)
              .set({
                remainingBalance: remainingBalance - 3000,
                transactionStatus: "partially-paid",
              })
              .where(eq(TransactionsTable.transactionId, transactionId))
              .execute();
            return c.json(PaymentDTO.parse(created[0]), 201);
          }
        } else {
          // If paymentTerms is "full-payment"
          if (mode === "cash") {
            const created = await db
              .insert(PaymentsTable)
              .values({
                ...parsed,
                amountPaid: transaction.remainingBalance,
                category: "payment",
              })
              .returning();
            await db
              .update(TransactionsTable)
              .set({
                remainingBalance: 0,
                transactionStatus: "paid",
              })
              .where(eq(TransactionsTable.transactionId, transactionId))
              .execute();
            return c.json(PaymentDTO.parse(created[0]), 201);
          } else {
            if (!parsed.reference || !parsed.imageUrl) {
              return c.json(
                {
                  error:
                    "Reference and imageUrl are required for online payments",
                },
                400
              );
            }
            const created = await db
              .insert(PaymentsTable)
              .values({
                ...parsed,
                amountPaid: transaction.remainingBalance,
                category: "payment",
              })
              .returning();
            await db
              .update(TransactionsTable)
              .set({
                remainingBalance: 0,
                transactionStatus: "paid",
              })
              .where(eq(TransactionsTable.transactionId, transactionId))
              .execute();
            return c.json(PaymentDTO.parse(created[0]), 201);
          }
        }
      }
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

paymentRoutes.openapi(
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
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PAYMENT", "update");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update payment.");
      }

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

export default paymentRoutes;
