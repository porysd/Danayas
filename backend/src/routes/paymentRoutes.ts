import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  PaymentDTO,
  CreatePaymentDTO,
  UpdatePaymentDTO,
} from "../dto/paymentDTO";
import db from "../config/database";
import { BookingsTable, PaymentsTable, UsersTable } from "../schemas/schema";
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
      const { bookingId, paymentMethod, tenderedAmount } = parsed;

      // Select the booking by bookingId
      const booking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, bookingId),
      });

      if (!booking) {
        throw new NotFoundError("Booking not found.");
      }

      if (booking.bookStatus === "cancelled" || booking.bookStatus === "completed") {
        return c.json({ error: "Cannot create payment for this booking status" }, 400);
      }

      if (booking.bookingPaymentStatus === "paid") {
        return c.json({ error: "Booking already paid" }, 400);
      }

      const latestPayment = await db.query.PaymentsTable.findFirst({
        where: eq(PaymentsTable.bookingId, bookingId),
        orderBy: [desc(PaymentsTable.createdAt)],
      });

      if (latestPayment?.paymentStatus === "pending") {
        return c.json({ error: "Previous payment is still pending" }, 400);
      }

      const user = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userId, userId),
      });

      if (!user) {
        throw new NotFoundError("User not found.");
      }

      const isCustomer = user.role === "customer";
      const isEmployee = user.role === "admin" || user.role === "staff";

      const remainingBalance = booking.remainingBalance;
      const paymentTerms = booking.paymentTerms;
      const isInstallment = paymentTerms === "installment"
      const isFullPayment = paymentTerms === "full-payment"

      if (isFullPayment && !(tenderedAmount - booking.totalAmount === 0) && !latestPayment) {
        return c.json({ error: "Full payment must be equal to the total amount" }, 400);
      }

      if (paymentMethod === "gcash" && (!parsed.reference || !parsed.imageUrl)) {
        return c.json({ error: "Reference and imageUrl are required for online payments" }, 400);
      }
      if (paymentMethod === "cash" && (parsed.reference || parsed.imageUrl)){
        return c.json({ error: "Reference and imageUrl are not required for cash payments"}, 400);
      }
  
      if (tenderedAmount > remainingBalance) {
        return c.json({ error: "Tendered amount is greater than the remaining balance" }, 400);
      }

      // If full payment does every extra add ons or pax required to be paid in full or not
      if (isInstallment && tenderedAmount < 2000 && !latestPayment) {
        return c.json({ error: "Minimum down payment amount is 2000" }, 400);
      }

      const changeAmount = Math.max(tenderedAmount - remainingBalance, 0);
      const netPaidAmount = tenderedAmount - changeAmount;

      const created = await db.transaction(async (tx) => {
        const paymentStatus = isEmployee ? "valid" : "pending";
        const newPayment = await tx.insert(PaymentsTable).values({
          ...parsed,
          tenderedAmount,
          changeAmount,
          netPaidAmount,
          paymentStatus: paymentStatus,
        }).returning();

        if(isEmployee){
          const updatedAmountPaid = booking.amountPaid + netPaidAmount;
          const updatedRemainingBalance = booking.remainingBalance - netPaidAmount;
          const updatedBookingPaymentStatus = updatedRemainingBalance === 0 ? "paid" : "partially-paid";
          
          await tx.update(BookingsTable)
            .set({
              amountPaid: updatedAmountPaid,
              remainingBalance: updatedRemainingBalance,
              bookingPaymentStatus: updatedBookingPaymentStatus,
              bookStatus: "reserved"
            })
            .where(eq(BookingsTable.bookingId, bookingId))
            .execute();
        }
        return newPayment[0];
      })
      return c.json(PaymentDTO.parse(created), 201);
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

      const parsed = UpdatePaymentDTO.parse(await c.req.json());

      const verifiedBy = userId;
      const paymentStatus = parsed.paymentStatus;

      const payment = await db.query.PaymentsTable.findFirst({
        where: eq(PaymentsTable.paymentId, paymentId),
      });

      if (!payment) {
        throw new NotFoundError("Payment not found.");
      }

      const updatedPayment = await db.transaction(async (tx) => {
        if (paymentStatus === "valid" && payment.paymentStatus !== "valid") {
          const booking = await tx.query.BookingsTable.findFirst({
            where: eq(BookingsTable.bookingId, payment.bookingId),
          });
          if (!booking) {
            throw new NotFoundError("Booking not found.");
          }
          const amountPaid = booking.amountPaid + payment.netPaidAmount;
          const remainingBalance =
            booking.remainingBalance - payment.netPaidAmount;
          const bookingPaymentStatus =
            remainingBalance === 0 ? "paid" : "partially-paid";

          const updatedBooking = await tx
            .update(BookingsTable)
            .set({
              amountPaid: amountPaid,
              remainingBalance: remainingBalance,
              bookingPaymentStatus: bookingPaymentStatus,
              bookStatus: "reserved",
            })
            .where(eq(BookingsTable.bookingId, payment.bookingId))
            .returning()
            .execute();
        }

        if (paymentStatus === "invalid") {
          // TODO: A way to notify the customer that the payment is invalid
          if (!parsed.remarks) {
            return c.json(
              {
                error: "Remarks are required when invalidating a payment",
              },
              400
            );
          }
        }

        if (paymentStatus === "voided") {
          // TODO: subtract the netPaidAmount from the booking (to undo the previously applied amount)
          // TODO: A way to notify the customer that the payment is voided
          if (!parsed.remarks) {
            return c.json(
              {
                error: "Remarks are required when voiding a payment",
              },
              400
            );
          }
        }

        const result = await tx
          .update(PaymentsTable)
          .set({ ...parsed, verifiedBy, paymentStatus })
          .where(eq(PaymentsTable.paymentId, paymentId))
          .returning()
          .execute();

        if (result.length === 0) {
          throw new NotFoundError("Payment not found.");
        }

        return result[0];
      });

      return c.json(updatedPayment);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default paymentRoutes;
