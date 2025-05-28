import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { BookingsTable } from "../schemas/Booking";
import {
  BookingDTO,
  CreateBookingDTO,
  UpdateBookingDTO,
} from "../dto/bookingDTO";
import { DiscountsTable } from "../schemas/Discounts";
import { and, eq, ne, sql } from "drizzle-orm";
import { processBookingData } from "../utils/dateHelpers";
import { PackagesTable } from "../schemas/Packages";
import { PaymentsTable } from "../schemas/Payment";
import { UsersTable } from "../schemas/User";
import { fi } from "@faker-js/faker";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { dateConflicts } from "../utils/dateConflict";
import { errorHandler } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";
import { RefundsTable } from "../schemas/Refund";
import { RefundPaymentsTable } from "../schemas/RefundPayment";
import { AuditLogsTable } from "../schemas/AuditLog";

const bookingRoutes = new OpenAPIHono<AuthContext>();

bookingRoutes.use("/*", authMiddleware);

bookingRoutes.openapi(
  createRoute({
    tags: ["Bookings"],
    summary: "Get all bookings",
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
        content: {
          "application/json": {
            schema: BookingDTO.array(),
          },
        },
        description: "Retrieve all bookings",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "No bookings found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "BOOKING", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get bookings.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const bookings = await db.query.BookingsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allBookings = bookings.map((booking) => {
        try {
          return BookingDTO.parse(booking);
        } catch (err) {
          throw new BadRequestError("Invalid booking data format.");
        }
      });

      return c.json({
        total: bookings.length,
        items: allBookings,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

bookingRoutes.openapi(
  createRoute({
    tags: ["Bookings"],
    summary: "Retrieve Booking by ID",
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
        id: z.coerce.number().openapi({ description: "Booking ID" }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: BookingDTO,
          },
        },
        description: "Retrieve the booking by ID",
      },
      404: {
        description: "Booking not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "BOOKING", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get booking.");
      }

      const paramId = Number(c.req.param("id"));

      if (isNaN(paramId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const booking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, paramId),
      });

      if (!booking) {
        throw new NotFoundError("Booking not found.");
      }

      try {
        const validatedUser = BookingDTO.parse(booking);
        return c.json(validatedUser);
      } catch (error) {
        throw new BadRequestError("Invalid booking data structure");
      }
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

bookingRoutes.openapi(
  createRoute({
    tags: ["Bookings"],
    summary: "Create Booking",
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
        description: "Booking credentials",
        required: true,
        content: {
          "application/json": {
            schema: CreateBookingDTO,
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: CreateBookingDTO,
          },
        },
        description: "Booking Created Successfully",
      },
      400: {
        description: "Invalid booking data",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "BOOKING", "create");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create booking.");
      }

      const body = c.req.valid("json");

      const reservationType = body.reservationType || "online";

      let userDetails = null;
      let createdByUser = null;

      if (reservationType === "online") {
        if (!body.userId) {
          throw new BadRequestError(
            "Online reservations require a user account."
          );
        }

        userDetails = await db
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.userId, body.userId))
          .then((rows) => rows[0]);

        if (!userDetails) {
          throw new BadRequestError("User not found.");
        }

        if (!["admin", "staff", "customer"].includes(userDetails.role)) {
          throw new BadRequestError(
            "Only admin, staff, or customer roles can make online reservations."
          );
        }
      }
      if (reservationType === "walk-in") {
        if (!body.userId) {
          throw new BadRequestError(
            "Walk-in bookings must be created by staff or admin."
          );
        }

        createdByUser = await db
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.userId, body.userId))
          .then((rows) => rows[0]);

        if (!createdByUser) {
          throw new BadRequestError("Creator user not found.");
        }

        if (!["admin", "staff"].includes(createdByUser.role)) {
          throw new BadRequestError(
            "Only admin or staff roles can create walk-in bookings."
          );
        }
      }

      const { discountId, packageId } = body;
      // Getting Package Price
      const selectedPackage = await db.query.PackagesTable.findFirst({
        where: eq(PackagesTable.packageId, packageId),
      });

      if (!selectedPackage) {
        throw new BadRequestError("Invalid package ID");
      }

      let discountPercent = 0;
      // Getting Discount Percentage if not null
      if (discountId) {
        const SelectedDiscount = await db.query.DiscountsTable.findFirst({
          where: eq(DiscountsTable.discountId, discountId),
        });
        if (!SelectedDiscount) {
          throw new BadRequestError("Invalid discount ID");
        }
        discountPercent = SelectedDiscount.percentage ?? 0;
      }

      const totalAmount =
        selectedPackage.price - selectedPackage.price * (discountPercent / 100);

      const processedBody = {
        ...processBookingData(body),
        userId: body.userId,
        totalAmount,
        catering: body.catering ? 1 : 0,
        firstName: body.firstName || userDetails?.firstName || null,
        lastName: body.lastName || userDetails?.lastName || null,
        contactNo: body.contactNo || userDetails?.contactNo || null,
        emailAddress: body.emailAddress || userDetails?.email || null,
        address: body.address || userDetails?.address || null,
        amountPaid: 0,
        remainingBalance: totalAmount,
      };

      const mappedMode =
        body.mode === "day-time"
          ? "day-time"
          : body.mode === "night-time"
          ? "night-time"
          : "whole-day";

      await dateConflicts({
        date: processedBody.checkInDate,
        mode: mappedMode,
      });

      const created = await db.transaction(async (tx) => {
        const insertedBooking = (
          await tx
            .insert(BookingsTable)
            .values(processedBody)
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "create",
            tableName: "BOOKING",
            recordId: insertedBooking.bookingId,
            data: JSON.stringify(BookingDTO.parse(insertedBooking)),
            remarks: "Booking created",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return insertedBooking;
      });

      return c.json(
        {
          ...created,
          catering: created.catering === 1,
        },
        201
      );
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

bookingRoutes.openapi(
  createRoute({
    tags: ["Bookings"],
    summary: "Update Booking by ID",
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
        description: "Update Booking",
        required: true,
        content: {
          "application/json": { schema: UpdateBookingDTO },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: BookingDTO,
          },
        },
        description: "Booking Updated Successfully",
      },
      400: {
        description: "Invalid booking ID",
      },
      404: {
        description: "Booking not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "BOOKING", "update");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update booking.");
      }

      const bookingId = Number(c.req.param("id"));

      if (isNaN(bookingId)) {
        throw new BadRequestError("Invalid booking ID.");
      }

      const requestData = UpdateBookingDTO.parse(await c.req.json());
      const booking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, bookingId),
      });

      if (!booking) {
        throw new NotFoundError("Booking not found.");
      }

      if (
        booking.bookStatus !== "reserved" &&
        booking.bookStatus !== "rescheduled"
      ) {
        throw new BadRequestError("Only reserved bookings can be rescheduled.");
      }

      const processedData = processBookingData(requestData);

      const dateChanged =
        processedData.checkInDate !== booking.checkInDate.split("T")[0];
      const modeChanged = requestData.mode && requestData.mode !== booking.mode;

      if (dateChanged || modeChanged) {
        const mappedMode =
          requestData.mode === "day-time"
            ? "day-time"
            : requestData.mode === "night-time"
            ? "night-time"
            : "whole-day";

        await dateConflicts({
          date: processedData.checkInDate,
          mode: mappedMode,
          bookingId: booking.bookingId.toString(),
        });
      }

      const hasRescheduled =
        processedData.checkInDate !== booking.checkInDate.split("T")[0] ||
        processedData.checkOutDate !== booking.checkOutDate.split("T")[0];

      const updated = await db.transaction(async (tx) => {
        const updatedBooking = (
          await tx
            .update(BookingsTable)
            .set({
              ...processedData,
              hasRescheduled: hasRescheduled ? 1 : 0,
              bookStatus: "rescheduled",
            })
            .where(eq(BookingsTable.bookingId, bookingId))
            .returning()
            .execute()
        )[0];

        await tx.insert(AuditLogsTable).values({
          userId: userId,
          action: "update",
          tableName: "BOOKING",
          recordId: bookingId,
          data: JSON.stringify(BookingDTO.parse(updatedBooking)),
          remarks: "Booking updated",
          createdAt: new Date().toISOString(),
        });

        return updatedBooking;
      });

      return c.json({
        status: "success",
        message: "Booking updated successfully.",
        updatedBooking: updated,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

bookingRoutes.openapi(
  createRoute({
    tags: ["Bookings"],
    summary: "Update Booking Status by ID",
    method: "patch",
    path: "/:id/status",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      body: {
        description: "Update Booking Status",
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              bookStatus: z.enum([
                "pending",
                "reserved",
                "cancelled",
                "completed",
                "rescheduled",
                "pending-cancellation",
              ]),
              cancelCategory: z
                .enum(["natural-disaster", "others"])
                .optional()
                .nullable(),
              cancelReason: z.string().optional().nullable(),
              refundMethod: z.enum(["gcash", "cash"]).optional().nullable(),
              receiveName: z.string().optional().nullable(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: BookingDTO.pick({ bookStatus: true }),
          },
        },
        description: "Booking Status Updated",
      },
      400: {
        description: "Invalid booking ID or status",
      },
      404: {
        description: "Booking Not Found",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "BOOKING", "update");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update booking status.");
      }

      const bookingId = Number(c.req.param("id"));
      const {
        bookStatus,
        cancelCategory,
        cancelReason,
        refundMethod,
        receiveName,
      } = await c.req.json();

      const existingBooking = await db
        .select()
        .from(BookingsTable)
        .where(eq(BookingsTable.bookingId, bookingId))
        .execute();

      if (!existingBooking || existingBooking.length === 0) {
        throw new NotFoundError("Booking not found");
      }

      const booking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, bookingId),
      });
      if (!booking) {
        throw new NotFoundError("Booking not found");
      }
      if (
        ["cancelled", "pending-cancellation", "completed"].includes(
          bookStatus
        ) &&
        booking.bookStatus !== "reserved" &&
        booking.bookStatus !== "rescheduled"
      ) {
        throw new BadRequestError(
          "Only reserved bookings can be cancelled or completed."
        );
      }

      if (
        bookStatus === "cancelled" &&
        (!cancelCategory?.trim() || !cancelReason?.trim())
      ) {
        throw new BadRequestError("Cancel details required");
      }

      const updated = await db.transaction(async (tx) => {
        if (bookStatus === "pending-cancellation") {
          if (!cancelCategory?.trim() || !cancelReason?.trim()) {
            throw new BadRequestError("Cancel details required");
          }
          if (!refundMethod) {
            throw new BadRequestError("Refund Method is required");
          }

          if (refundMethod === "cash") {
            if (!receiveName) {
              throw new BadRequestError("Receiver is required");
            }
          }
          // Check all existing payments for the booking thats valid
          const allValidPayments = await db.query.PaymentsTable.findMany({
            where: and(
              eq(PaymentsTable.bookingId, bookingId),
              eq(PaymentsTable.paymentStatus, "valid")
            ),
          });

          if (allValidPayments.length === 0) {
            throw new BadRequestError(
              "No valid payments found for the booking."
            );
          }

          const totalPaid = allValidPayments.reduce((sum, payment) => {
            return sum + payment.netPaidAmount;
          }, 0);

          const refund = (
            await tx
              .insert(RefundsTable)
              .values({
                bookingId: bookingId,
                publicEntryId: null,
                refundAmount: totalPaid * 0.5,
                refundMethod: refundMethod,
                receiveName: receiveName,
                refundStatus: "pending",
                refundType: "cancellation",
                refundReason:
                  cancelCategory.toUpperCase() + ": " + cancelReason,
              })
              .returning()
              .execute()
          )[0];

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: userId,
              action: "create",
              tableName: "REFUND",
              recordId: refund.refundId,
              data: JSON.stringify({
                bookingId: bookingId,
                refundAmount: refund.refundAmount,
                refundStatus: refund.refundStatus,
                refundReason: refund.refundReason,
                refundMethod: refund.refundMethod,
                receiveName: refund.receiveName,
              }),
              remarks: "Refund created for booking cancellation",
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
        }

        if (bookStatus === "completed") {
          const booking = await db.query.BookingsTable.findFirst({
            where: eq(BookingsTable.bookingId, bookingId),
          });

          if (!booking || booking.bookingPaymentStatus !== "paid") {
            throw new BadRequestError("Booking should be paid to be completed");
          }
        }

        const updatedBooking = (
          await tx
            .update(BookingsTable)
            .set({
              bookStatus,
              cancelCategory:
                bookStatus === "cancelled" ||
                bookStatus === "pending-cancellation"
                  ? cancelCategory
                  : null,
              cancelReason:
                bookStatus === "cancelled" ||
                bookStatus === "pending-cancellation"
                  ? cancelReason ?? null
                  : null,
            })
            .where(eq(BookingsTable.bookingId, bookingId))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "status-change",
            tableName: "BOOKING",
            recordId: bookingId,
            data: JSON.stringify({
              bookingId: updatedBooking.bookingId,
              bookStatus: updatedBooking.bookStatus,
              cancelCategory: updatedBooking.cancelCategory,
              cancelReason: updatedBooking.cancelReason,
            }),
            remarks: `Booking status updated to ${updatedBooking.bookStatus}`,
            createdAt: new Date().toISOString(),
          })
          .execute();

        return updatedBooking;
      });

      return c.json(
        {
          message: "Booking status updated",
          bookStatus: updated.bookStatus,
        },
        200
      );
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);

bookingRoutes.openapi(
  createRoute({
    tags: ["Bookings"],
    summary: "Delete booking by ID",
    method: "delete",
    path: "/:id",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
    },
    responses: {
      200: {
        description: "Booking Deleted",
      },
      400: {
        description: "Invalid booking ID",
      },
      404: {
        description: "Booking not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "BOOKING", "delete");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to delete booking.");
      }

      const bookingId = Number(c.req.param("id"));

      if (isNaN(bookingId)) {
        throw new BadRequestError("Invalid bookingId.");
      }

      const deletedBooking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, bookingId),
      });

      if (!deletedBooking) {
        throw new NotFoundError("Booking not found.");
      }

      const deleted = await db.transaction(async (tx) => {
        await tx
          .delete(BookingsTable)
          .where(eq(BookingsTable.bookingId, bookingId))
          .execute();
        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "delete",
            tableName: "BOOKING",
            recordId: bookingId,
            data: JSON.stringify(BookingDTO.parse(deletedBooking)),
            remarks: "Booking deleted",
            createdAt: new Date().toISOString(),
          })
          .execute();
      });

      return c.json({
        status: "success",
        message: "Booking deleted successfully.",
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default bookingRoutes;
