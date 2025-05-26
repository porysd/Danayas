import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { RefundDTO, CreateRefundDTO, UpdateRefundDTO } from "../dto/refundDTO";
import db from "../config/database";
import {
  BookingsTable,
  PaymentsTable,
  RefundPaymentsTable,
  RefundsTable,
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

const refundRoutes = new OpenAPIHono<AuthContext>();

refundRoutes.use("/*", authMiddleware);

refundRoutes.openapi(
  createRoute({
    tags: ["Refunds"],
    summary: "Retrieve all refunds",
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
        description: "Retrieved all refunds",
        content: {
          "application/json": {
            schema: z.object({
              total: z.number(),
              items: RefundDTO.array(),
            }),
          },
        },
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "No refunds found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "REFUND", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get refunds.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const refunds = await db.query.RefundsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      return c.json({
        total: refunds.length,
        items: refunds,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

refundRoutes.openapi(
  createRoute({
    tags: ["Refunds"],
    summary: "Get Refund By ID",
    method: "get",
    path: "/:id",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      params: z.object({
        id: z.coerce.number().openapi({ description: "Id to find" }),
      }),
    },
    responses: {
      200: {
        description: "Successful refund retrieval",
        content: {
          "application/json": {
            schema: RefundDTO,
          },
        },
      },
      400: {
        description: "Invalid refund ID",
      },
      404: {
        description: "Refund not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "REFUND", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get refund.");
      }

      const { id } = c.req.valid("param");

      const dbRefund = await db.query.RefundsTable.findFirst({
        where: eq(RefundsTable.refundId, id),
      });

      if (!dbRefund) {
        throw new NotFoundError("Refund not found");
      }

      return c.json(dbRefund);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

refundRoutes.openapi(
  createRoute({
    tags: ["Refunds"],
    summary: "Create Refund",
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
        content: {
          "application/json": {
            schema: CreateRefundDTO,
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: RefundDTO,
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
      const hasPermission = await verifyPermission(userId, "REFUND", "create");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create refunds.");
      }
      const parsed = CreateRefundDTO.parse(await c.req.json());

      const { bookingId, publicEntryId } = parsed;

      if (
        parsed.refundMethod === "gcash" &&
        (!parsed.reference || !parsed.imageUrl)
      ) {
        return c.json(
          {
            error: "Reference and imageUrl are required for online payments",
          },
          400
        );
      }
      if (
        parsed.refundMethod === "cash" &&
        (parsed.reference || parsed.imageUrl)
      ) {
        return c.json(
          {
            error: "Reference and imageUrl are not required for cash payments",
          },
          400
        );
      }
      if (bookingId && publicEntryId) {
        return c.json(
          { error: "Either bookingId or publicEntryId must be provided" },
          400
        );
      }
      if (bookingId) {
        const allValidPayments = await db.query.PaymentsTable.findMany({
          where: and(
            eq(PaymentsTable.bookingId, parsed.bookingId!),
            eq(PaymentsTable.paymentStatus, "valid")
          ),
        });

        if (allValidPayments.length === 0) {
          throw new BadRequestError("No valid payments found for the booking.");
        }

        const totalPaid = allValidPayments.reduce((sum, payment) => {
          return sum + payment.netPaidAmount;
        }, 0);

        const refunded = await db.transaction(async (tx) => {
          const booking = await tx.query.BookingsTable.findFirst({
            where: eq(BookingsTable.bookingId, parsed.bookingId!),
          });
          if (!booking) {
            throw new NotFoundError("Booking not found.");
          }
          const previousRefund = await tx.query.RefundsTable.findFirst({
            where: and(
              eq(RefundsTable.bookingId, parsed.bookingId!),
              eq(RefundsTable.refundStatus, "completed")
            ),
          });
          if (previousRefund) {
            throw new BadRequestError("Booking already has a refund.");
          }
          const refundAmount = totalPaid * 0.5;
          const remainingBalance = booking.remainingBalance + refundAmount;
          const amountPaid = booking.amountPaid - refundAmount;
          const bookingPaymentStatus = "partially-paid";

          const updatedBooking = (
            await tx
              .update(BookingsTable)
              .set({
                remainingBalance: remainingBalance,
                bookingPaymentStatus: bookingPaymentStatus,
                bookStatus: "cancelled",
                amountPaid: amountPaid,
              })
              .where(eq(BookingsTable.bookingId, parsed.bookingId!))
              .returning()
              .execute()
          )[0];

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: userId,
              action: "update",
              tableName: "BOOKINGS",
              recordId: updatedBooking.bookingId,
              data: JSON.stringify(updatedBooking),
              remarks: "Booking cancelled due to refund",
              createdAt: new Date().toISOString(),
            })
            .execute();

          const refund = (
            await tx
              .insert(RefundsTable)
              .values({
                bookingId: parsed.bookingId,
                verifiedBy: userId,
                refundAmount: refundAmount,
                refundStatus: "completed",
                refundReason: parsed.refundReason ?? "",
                refundMethod: parsed.refundMethod,
                reference: parsed.reference ?? "",
                imageUrl: parsed.imageUrl ?? "",
                remarks: parsed.remarks ?? "",
              })
              .returning()
              .execute()
          )[0];

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: userId,
              action: "create",
              tableName: "REFUNDS",
              recordId: refund.refundId,
              data: JSON.stringify(refund),
              remarks: "Refund created for booking",
              createdAt: new Date().toISOString(),
            })
            .execute();

          await Promise.all(
            allValidPayments.map((payment) =>
              tx
                .insert(RefundPaymentsTable)
                .values({
                  refundId: refund.refundId,
                  paymentId: payment.paymentId,
                  amountRefunded: payment.netPaidAmount * 0.5,
                })
                .returning()
                .execute()
            )
          );
          return refund;
        });

        return c.json(RefundDTO.parse(refunded), 201);
      } else if (publicEntryId) {
        const allValidPayments = await db.query.PaymentsTable.findMany({
          where: and(
            eq(PaymentsTable.publicEntryId, parsed.publicEntryId!),
            eq(PaymentsTable.paymentStatus, "valid")
          ),
        });

        if (allValidPayments.length === 0) {
          throw new BadRequestError("No valid payments found for the booking.");
        }

        const totalPaid = allValidPayments.reduce((sum, payment) => {
          return sum + payment.netPaidAmount;
        }, 0);

        const refunded = await db.transaction(async (tx) => {
          const publics = await tx.query.PublicEntryTable.findFirst({
            where: eq(PublicEntryTable.publicEntryId, parsed.publicEntryId!),
          });
          if (!publics) {
            throw new NotFoundError("Booking not found.");
          }
          const previousRefund = await tx.query.RefundsTable.findFirst({
            where: and(
              eq(RefundsTable.publicEntryId, parsed.publicEntryId!),
              eq(RefundsTable.refundStatus, "completed")
            ),
          });
          if (previousRefund) {
            throw new BadRequestError("Booking already has a refund.");
          }
          const refundAmount = totalPaid * 0.5;
          const remainingBalance = publics.remainingBalance + refundAmount;
          const amountPaid = publics.amountPaid - refundAmount;
          const publicPaymentStatus = "partially-paid";

          const updatedBooking = (
            await tx
              .update(PublicEntryTable)
              .set({
                remainingBalance: remainingBalance,
                publicPaymentStatus: publicPaymentStatus,
                status: "cancelled",
                amountPaid: amountPaid,
              })
              .where(eq(PublicEntryTable.publicEntryId, parsed.publicEntryId!))
              .returning()
              .execute()
          )[0];

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: userId,
              action: "update",
              tableName: "PUBLIC_ENTRY",
              recordId: updatedBooking.publicEntryId,
              data: JSON.stringify(updatedBooking),
              remarks: "Public entry cancelled due to refund",
              createdAt: new Date().toISOString(),
            })
            .execute();

          const refund = (
            await tx
              .insert(RefundsTable)
              .values({
                publicEntryId: parsed.publicEntryId,
                verifiedBy: userId,
                refundAmount: refundAmount,
                refundStatus: "completed",
                refundReason: parsed.refundReason ?? "",
                refundMethod: parsed.refundMethod,
                reference: parsed.reference ?? "",
                imageUrl: parsed.imageUrl ?? "",
                remarks: parsed.remarks ?? "",
              })
              .returning()
              .execute()
          )[0];

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: userId,
              action: "create",
              tableName: "REFUNDS",
              recordId: refund.refundId,
              data: JSON.stringify(refund),
              remarks: "Refund created for public entry",
              createdAt: new Date().toISOString(),
            })
            .execute();

          await Promise.all(
            allValidPayments.map((payment) =>
              tx
                .insert(RefundPaymentsTable)
                .values({
                  refundId: refund.refundId,
                  paymentId: payment.paymentId,
                  amountRefunded: payment.netPaidAmount * 0.5,
                })
                .returning()
                .execute()
            )
          );
          return refund;
        });

        return c.json(RefundDTO.parse(refunded), 201);
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

refundRoutes.openapi(
  createRoute({
    tags: ["Refunds"],
    summary: "Update Refund by ID",
    method: "patch",
    path: "/:id",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      body: {
        description: "Update Refund",
        required: true,
        content: {
          "application/json": { schema: UpdateRefundDTO },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: RefundDTO,
          },
        },
        description: "Refund Updated Successfully",
      },
      400: {
        description: "Invalid refund ID or data",
      },
      404: {
        description: "Refund not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "REFUND", "update");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update refund.");
      }

      const refundId = Number(c.req.param("id"));

      if (isNaN(refundId)) {
        throw new BadRequestError("Invalid refund ID.");
      }

      const parsed = UpdateRefundDTO.parse(await c.req.json());

      if (
        parsed.refundMethod === "gcash" &&
        (!parsed.reference || !parsed.imageUrl)
      ) {
        return c.json(
          { error: "Reference and imageUrl are required for online payments" },
          400
        );
      }
      if (
        parsed.refundMethod === "cash" &&
        (parsed.reference || parsed.imageUrl)
      ) {
        return c.json(
          {
            error: "Reference and imageUrl are not required for cash payments",
          },
          400
        );
      }

      const verifiedBy = parsed.verifiedBy;
      if (!verifiedBy || isNaN(verifiedBy)) {
        return c.json(
          { error: "verifiedBy is required and must be a valid user ID." },
          400
        );
      }
      const refundStatus = parsed.refundStatus;

      const refund = await db.query.RefundsTable.findFirst({
        where: eq(RefundsTable.refundId, refundId),
      });
      if (!refund) {
        throw new NotFoundError("Refund not found.");
      }
      if (
        refund.refundStatus === "completed" &&
        parsed.refundStatus !== "completed"
      ) {
        throw new BadRequestError("Cannot revert a completed refund.");
      }

      const updatedRefund = await db.transaction(async (tx) => {
        if (
          refund.refundStatus !== "completed" &&
          parsed.refundStatus === "completed"
        ) {
          if (
            !parsed.refundMethod ||
            parsed.refundMethod.toString().trim() === ""
          ) {
            throw new BadRequestError(
              "refundMethod is required to complete a refund."
            );
          }
          if (
            !parsed.senderName ||
            parsed.senderName.toString().trim() === ""
          ) {
            throw new BadRequestError(
              "senderName is required to complete a refund."
            );
          }

          if (refund.publicEntryId == null) {
            if (refund.bookingId == null) {
              throw new NotFoundError("Booking ID is missing for this refund.");
            }
            const booking = await tx.query.BookingsTable.findFirst({
              where: eq(BookingsTable.bookingId, refund.bookingId),
            });
            if (!booking) {
              throw new NotFoundError("Booking not found.");
            }
            const refundAmount = refund.refundAmount;
            const remainingBalance = booking.remainingBalance + refundAmount;
            const amountPaid = booking.amountPaid - refundAmount;
            const bookingPaymentStatus = "partially-paid";

            const updatedBooking = (
              await tx
                .update(BookingsTable)
                .set({
                  remainingBalance: remainingBalance,
                  bookingPaymentStatus: bookingPaymentStatus,
                  bookStatus: "cancelled",
                  amountPaid: amountPaid,
                })
                .where(eq(BookingsTable.bookingId, refund.bookingId))
                .returning()
                .execute()
            )[0];

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "BOOKINGS",
                recordId: updatedBooking.bookingId,
                data: JSON.stringify(updatedBooking),
                remarks: "Booking cancelled due to refund",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
          if (refund.bookingId == null) {
            if (refund.publicEntryId == null) {
              throw new NotFoundError("Public Entry ID not found");
            }
            const booking = await tx.query.PublicEntryTable.findFirst({
              where: eq(PublicEntryTable.publicEntryId, refund.publicEntryId),
            });
            if (!booking) {
              throw new NotFoundError("Booking not found.");
            }
            const refundAmount = refund.refundAmount;
            const remainingBalance = booking.remainingBalance + refundAmount;
            const amountPaid = booking.amountPaid - refundAmount;
            const publicPaymentStatus = "partially-paid";

            const updatedBooking = (
              await tx
                .update(PublicEntryTable)
                .set({
                  remainingBalance: remainingBalance,
                  publicPaymentStatus: publicPaymentStatus,
                  status: "cancelled",
                  amountPaid: amountPaid,
                })
                .where(eq(PublicEntryTable.publicEntryId, refund.publicEntryId))
                .returning()
                .execute()
            )[0];

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "PUBLIC_ENTRY",
                recordId: updatedBooking.publicEntryId,
                data: JSON.stringify(updatedBooking),
                remarks: "Public entry cancelled due to refund",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
        }

        if (
          refund.refundStatus !== "failed" &&
          parsed.refundStatus === "failed"
        ) {
          if (!parsed.remarks) {
            throw new BadRequestError(
              "Remarks are required to mark a refund as failed."
            );
          }
          if (refund.publicEntryId == null) {
            if (refund.bookingId == null) {
              throw new NotFoundError("Booking ID is missing for this refund.");
            }
            const booking = await tx.query.BookingsTable.findFirst({
              where: eq(BookingsTable.bookingId, refund.bookingId),
            });
            if (!booking) {
              throw new NotFoundError("Booking not found.");
            }

            const updatedBooking = (
              await tx
                .update(BookingsTable)
                .set({
                  bookStatus: "cancelled",
                })
                .where(eq(BookingsTable.bookingId, refund.bookingId))
                .returning()
                .execute()
            )[0];

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "BOOKINGS",
                recordId: updatedBooking.bookingId,
                data: JSON.stringify(updatedBooking),
                remarks: "Booking cancelled due to refund",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
          if (refund.bookingId == null) {
            if (refund.publicEntryId == null) {
              throw new NotFoundError("Public Entry ID not found");
            }
            const booking = await tx.query.PublicEntryTable.findFirst({
              where: eq(PublicEntryTable.publicEntryId, refund.publicEntryId),
            });
            if (!booking) {
              throw new NotFoundError("Booking not found.");
            }
            const updatedBooking = (
              await tx
                .update(PublicEntryTable)
                .set({
                  status: "cancelled",
                })
                .where(eq(PublicEntryTable.publicEntryId, refund.publicEntryId))
                .returning()
                .execute()
            )[0];

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "PUBLIC_ENTRY",
                recordId: updatedBooking.publicEntryId,
                data: JSON.stringify(updatedBooking),
                remarks: "Public entry cancelled due to refund",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
        }

        const result = (
          await tx
            .update(RefundsTable)
            .set({ ...parsed, verifiedBy, refundStatus })
            .where(eq(RefundsTable.refundId, refundId))
            .returning()
            .execute()
        )[0];

        if (!result) {
          throw new NotFoundError("Payment not found.");
        }

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "update",
            tableName: "REFUNDS",
            recordId: result.refundId,
            data: JSON.stringify(result),
            remarks: "Refund updated",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return result;
      });
      return c.json(updatedRefund);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default refundRoutes;
