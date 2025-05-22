import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  PaymentDTO,
  CreatePaymentDTO,
  UpdatePaymentDTO,
} from "../dto/paymentDTO";
import db from "../config/database";
import {
  BookingsTable,
  PaymentsTable,
  UsersTable,
  PublicEntryTable,
  AuditLogsTable,
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
      const {
        bookingId,
        publicEntryId,
        paymentMethod,
        tenderedAmount,
        senderName,
      } = parsed;

      const user = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userId, userId),
      });

      if (!user) {
        throw new NotFoundError("User not found.");
      }

      const isCustomer = user.role === "customer";
      const isEmployee = user.role === "admin" || user.role === "staff";

      if (bookingId) {
        //Handle Private Booking
        // Select the booking by bookingId
        const booking = await db.query.BookingsTable.findFirst({
          where: eq(BookingsTable.bookingId, bookingId),
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

        const remainingBalance = booking.remainingBalance;
        const paymentTerms = booking.paymentTerms;
        const isInstallment = paymentTerms === "installment";
        const isFullPayment = paymentTerms === "full-payment";

        if (
          isFullPayment &&
          tenderedAmount !== undefined &&
          !(tenderedAmount - booking.totalAmount === 0) &&
          !latestPayment
        ) {
          return c.json(
            { error: "Full payment must be equal to the total amount" },
            400
          );
        }

        if (
          paymentMethod === "gcash" &&
          (!parsed.reference || !parsed.imageUrl)
        ) {
          return c.json(
            {
              error: "Reference and imageUrl are required for online payments",
            },
            400
          );
        }
        if (paymentMethod === "cash" && (parsed.reference || parsed.imageUrl)) {
          return c.json(
            {
              error:
                "Reference and imageUrl are not required for cash payments",
            },
            400
          );
        }

        if (
          tenderedAmount !== undefined &&
          tenderedAmount > remainingBalance &&
          paymentMethod === "gcash"
        ) {
          return c.json(
            { error: "Tendered amount is greater than the remaining balance" },
            400
          );
        }

        // If full payment does every extra add ons or pax required to be paid in full or not
        if (
          isInstallment &&
          tenderedAmount !== undefined &&
          tenderedAmount < 2000 &&
          !latestPayment
        ) {
          return c.json({ error: "Minimum down payment amount is 2000" }, 400);
        }

        if (tenderedAmount === undefined) {
          return c.json({ error: "Tendered amount is required" }, 400);
        }
        const changeAmount = Math.max(tenderedAmount - remainingBalance, 0);
        const netPaidAmount = tenderedAmount - changeAmount;

        const created = await db.transaction(async (tx) => {
          const paymentStatus = isEmployee ? "valid" : "pending";
          // Ensure required fields are not undefined
          if (
            parsed.paymentMethod === undefined ||
            tenderedAmount === undefined ||
            netPaidAmount === undefined
          ) {
            throw new BadRequestError("Missing required payment fields.");
          }
          const paymentData: any = {
            bookingId: parsed.bookingId,
            paymentMethod: parsed.paymentMethod,
            senderName: parsed.senderName,
            tenderedAmount,
            changeAmount,
            netPaidAmount,
            paymentStatus: paymentStatus,
          };

          const newPayment = (
            await tx
              .insert(PaymentsTable)
              .values(paymentData)
              .returning()
              .execute()
          )[0];

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: userId,
              action: "create",
              tableName: "PAYMENTS",
              recordId: newPayment.paymentId,
              createdAt: new Date().toISOString(),
            })
            .execute();

          // For Private
          if (isEmployee) {
            const updatedAmountPaid = booking.amountPaid + netPaidAmount;
            const updatedRemainingBalance =
              booking.remainingBalance - netPaidAmount;
            const updatedBookingPaymentStatus =
              updatedRemainingBalance === 0 ? "paid" : "partially-paid";

            await tx
              .update(BookingsTable)
              .set({
                amountPaid: updatedAmountPaid,
                remainingBalance: updatedRemainingBalance,
                bookingPaymentStatus: updatedBookingPaymentStatus,
                bookStatus: "reserved",
              })
              .where(eq(BookingsTable.bookingId, bookingId))
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "BOOKINGS",
                recordId: bookingId,
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
          return newPayment;
        });
        return c.json(PaymentDTO.parse(created), 201);
      } else if (publicEntryId) {
        // Handle Public Booking
        const publics = await db.query.PublicEntryTable.findFirst({
          where: eq(PublicEntryTable.publicEntryId, publicEntryId),
        });

        if (!publics) {
          throw new NotFoundError("Public Entry not found.");
        }

        if (publics.status === "cancelled" || publics.status === "completed") {
          return c.json(
            { error: "Cannot create payment for this booking status" },
            400
          );
        }

        if (publics.publicPaymentStatus === "paid") {
          return c.json({ error: "Public Entry already paid" }, 400);
        }

        const latestPublicPayment = await db.query.PaymentsTable.findFirst({
          where: eq(PaymentsTable.publicEntryId, publicEntryId),
          orderBy: [desc(PaymentsTable.createdAt)],
        });

        if (latestPublicPayment?.paymentStatus === "pending") {
          return c.json({ error: "Previous payment is still pending" }, 400);
        }

        const publicBalance = publics.remainingBalance;
        const publicPayterms = publics.paymentTerms;
        const publicInstallment = publicPayterms === "installment";
        const publicFullPayment = publicPayterms === "full-payment";

        if (
          publicFullPayment &&
          tenderedAmount !== undefined &&
          !(tenderedAmount - publics.totalAmount === 0) &&
          !latestPublicPayment
        ) {
          return c.json(
            { error: "Fullpayment must be equal to the total amount" },
            400
          );
        }

        if (
          paymentMethod === "gcash" &&
          (!parsed.reference || !parsed.imageUrl)
        ) {
          return c.json(
            { error: "Reference and imageUrl are required for online payment" },
            400
          );
        }
        if (paymentMethod === "cash" && (parsed.reference || parsed.imageUrl)) {
          return c.json(
            {
              error:
                "Reference and imageUrl are not required for cash payments",
            },
            400
          );
        }

        if (
          tenderedAmount !== undefined &&
          tenderedAmount > publicBalance &&
          paymentMethod === "gcash"
        ) {
          return c.json(
            { error: "Tendered amount is greater than the remaining balance" },
            400
          );
        }

        // If full payment does every extra add ons or pax required to be paid in full or not
        if (
          publicInstallment &&
          tenderedAmount !== undefined &&
          tenderedAmount < 200 &&
          !latestPublicPayment
        ) {
          return c.json({ error: "Minimum down payment amount is 200" }, 400);
        }

        if (tenderedAmount === undefined) {
          return c.json({ error: "Tendered amount is required" }, 400);
        }
        const changeAmount = Math.max(tenderedAmount - publicBalance, 0);
        const netPaidAmount = tenderedAmount - changeAmount;

        const created = await db.transaction(async (tx) => {
          const paymentStatus = isEmployee ? "valid" : "pending";
          // Ensure required fields are not undefined
          if (
            parsed.paymentMethod === undefined ||
            tenderedAmount === undefined ||
            netPaidAmount === undefined
          ) {
            throw new BadRequestError("Missing required payment fields.");
          }
          const paymentData: any = {
            publicEntryId: parsed.publicEntryId,
            paymentMethod: parsed.paymentMethod,
            senderName: parsed.senderName,
            tenderedAmount,
            changeAmount,
            netPaidAmount,
            paymentStatus: paymentStatus,
          };

          const newPayment = (
            await tx.insert(PaymentsTable).values(paymentData).returning()
          )[0];

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: userId,
              action: "create",
              tableName: "PAYMENTS",
              recordId: newPayment.paymentId,
              createdAt: new Date().toISOString(),
            })
            .execute();

          // For Public
          if (isEmployee) {
            const updatedAmountPaid = publics.amountPaid + netPaidAmount;
            const updatePublicBalance =
              publics.remainingBalance - netPaidAmount;
            const updatePublicStatus =
              updatePublicBalance === 0 ? "paid" : "partially-paid";

            await tx
              .update(PublicEntryTable)
              .set({
                amountPaid: updatedAmountPaid,
                remainingBalance: updatePublicBalance,
                publicPaymentStatus: updatePublicStatus,
                status: "reserved",
              })
              .where(eq(PublicEntryTable.publicEntryId, publicEntryId))
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "PUBLIC_ENTRY",
                recordId: publicEntryId,
                createdAt: new Date().toISOString(),
              })
              .execute();
          }

          return newPayment;
        });
        return c.json(PaymentDTO.parse(created), 201);
      } else {
        // Return 400
        return c.json(
          { error: "Either bookingId or publicEntryId must be provided" },
          400
        );
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
          // Process Status in Private Booking
          if (payment.publicEntryId == null) {
            if (payment.bookingId == null) {
              throw new NotFoundError("Booking not found");
            }

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

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "BOOKINGS",
                recordId: payment.bookingId,
                createdAt: new Date().toISOString(),
              })
              .execute();
          }

          // Process Status in Public Entry
          if (payment.bookingId == null) {
            if (payment.publicEntryId == null) {
              throw new NotFoundError(" Public not found");
            }
            const publics = await tx.query.PublicEntryTable.findFirst({
              where: eq(PublicEntryTable.publicEntryId, payment.publicEntryId),
            });

            if (!publics) {
              throw new NotFoundError("Public Entry not found");
            }

            const amountPaid = publics.amountPaid + payment.netPaidAmount;
            const remainingBalance =
              publics.remainingBalance - payment.netPaidAmount;

            const publicPaymentStatus =
              remainingBalance === 0 ? "paid" : "partially-paid";

            const updatePublic = await tx
              .update(PublicEntryTable)
              .set({
                amountPaid: amountPaid,
                remainingBalance: remainingBalance,
                publicPaymentStatus: publicPaymentStatus,
                status: "reserved",
              })
              .where(eq(PublicEntryTable.publicEntryId, payment.publicEntryId))
              .returning()
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "PUBLIC_ENTRY",
                recordId: payment.publicEntryId,
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
        }

        if (paymentStatus === "invalid") {
          //TODO: Request another payment for customer when invalid
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
          // TODO: Bug => when there is payment and its voided the bookStatus and status(public) will be pending but paymentStatus => partially paid or paid
          if (!parsed.remarks) {
            return c.json(
              { error: "Remarks are required when voiding a payment" },
              400
            );
          }
          if (payment.paymentStatus === "valid") {
            if (payment.publicEntryId == null) {
              if (payment.bookingId == null) {
                throw new NotFoundError("Booking not Found");
              }
              const booking = await tx.query.BookingsTable.findFirst({
                where: eq(BookingsTable.bookingId, payment.bookingId),
              });

              if (!booking) {
                throw new NotFoundError("Booking not found.");
              }
              const amountPaid = booking.amountPaid - payment.netPaidAmount;
              const remainingBalance =
                booking.remainingBalance + payment.netPaidAmount;

              let bookingPaymentStatus: "paid" | "partially-paid" | "unpaid";

              if (amountPaid === 0) {
                bookingPaymentStatus = "unpaid";
              } else if (remainingBalance > 0) {
                bookingPaymentStatus = "partially-paid";
              } else {
                bookingPaymentStatus = "paid";
              }

              let bookStatus = booking.bookStatus;

              // Check if there are any other valid payments for this booking
              const otherValidPayments = await tx.query.PaymentsTable.findMany({
                where: and(
                  eq(PaymentsTable.bookingId, payment.bookingId),
                  eq(PaymentsTable.paymentStatus, "valid"),
                  ne(PaymentsTable.paymentId, paymentId)
                ),
              });

              if (
                otherValidPayments.length === 0 &&
                booking.bookStatus === "reserved"
              ) {
                bookStatus = "pending";
              }

              await tx
                .update(BookingsTable)
                .set({
                  amountPaid: amountPaid,
                  remainingBalance: remainingBalance,
                  bookingPaymentStatus: bookingPaymentStatus,
                  bookStatus: bookStatus,
                })
                .where(eq(BookingsTable.bookingId, payment.bookingId))
                .execute();

              await tx
                .insert(AuditLogsTable)
                .values({
                  userId: userId,
                  action: "update",
                  tableName: "BOOKINGS",
                  recordId: payment.bookingId,
                  createdAt: new Date().toISOString(),
                })
                .execute();
            }

            if (payment.bookingId == null) {
              if (payment.publicEntryId == null) {
                throw new NotFoundError("Public entry not found");
              }

              const publics = await tx.query.PublicEntryTable.findFirst({
                where: eq(
                  PublicEntryTable.publicEntryId,
                  payment.publicEntryId
                ),
              });

              if (!publics) {
                throw new NotFoundError("Public entry not found");
              }

              const amountPaid = publics.amountPaid - payment.netPaidAmount;
              const remainingBalance =
                publics.remainingBalance + payment.netPaidAmount;

              let publicPaymentStatus: "paid" | "partially-paid" | "unpaid";
              if (amountPaid === 0) {
                publicPaymentStatus = "unpaid";
              } else if (remainingBalance > 0) {
                publicPaymentStatus = "partially-paid";
              } else {
                publicPaymentStatus = "paid";
              }

              let status = publics.status;

              const otherValidPayment = await tx.query.PaymentsTable.findMany({
                where: and(
                  eq(PaymentsTable.publicEntryId, payment.publicEntryId),
                  eq(PaymentsTable.paymentStatus, "valid"),
                  ne(PaymentsTable.paymentId, paymentId)
                ),
              });

              if (
                otherValidPayment.length === 0 &&
                publics.status === "reserved"
              ) {
                status = "pending";
              }

              await tx
                .update(PublicEntryTable)
                .set({
                  amountPaid: amountPaid,
                  remainingBalance: remainingBalance,
                  publicPaymentStatus: publicPaymentStatus,
                  status: status,
                })
                .where(
                  eq(PublicEntryTable.publicEntryId, payment.publicEntryId)
                )
                .execute();

              await tx
                .insert(AuditLogsTable)
                .values({
                  userId: userId,
                  action: "update",
                  tableName: "PUBLIC_ENTRY",
                  recordId: payment.publicEntryId,
                  createdAt: new Date().toISOString(),
                })
                .execute();
            }
          }
        }

        const result = (
          await tx
            .update(PaymentsTable)
            .set({ ...parsed, verifiedBy, paymentStatus })
            .where(eq(PaymentsTable.paymentId, paymentId))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "update",
            tableName: "PAYMENTS",
            recordId: result.paymentId,
            createdAt: new Date().toISOString(),
          })
          .execute();

        if (!result) {
          throw new NotFoundError("Payment not found.");
        }

        return result;
      });

      return c.json(updatedPayment);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default paymentRoutes;
