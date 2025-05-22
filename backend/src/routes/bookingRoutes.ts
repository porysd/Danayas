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

      // Check for date conflicts
      // const conflictingBooking = await db.query.BookingsTable.findFirst({
      //   where: sql`
      //     bookStatus NOT IN ('cancelled', 'completed')
      //     AND date(checkInDate) = date(${processedBody.checkInDate})
      //     AND (
      //       (${body.mode} = 'whole-day')
      //       OR
      //       (mode = 'whole-day')
      //       OR
      //       (mode = ${body.mode})
      //     )
      //   `,
      // });

      // if (conflictingBooking) {
      //   if (body.mode === "whole-day") {
      //     throw new BadRequestError(
      //       `Cannot make a whole-day booking as there are existing bookings on this date.`
      //     );
      //   } else if (conflictingBooking.mode === "whole-day") {
      //     throw new BadRequestError(
      //       `Cannot book on this date as it is already booked for whole day.`
      //     );
      //   } else {
      //     throw new BadRequestError(
      //       `This date is already booked for ${body.mode}. Please choose a different date or time mode.`
      //     );
      //   }
      // }

      // Map mode values to match accepted types in dateConflicts
      // const mappedMode =
      //   body.mode === "day-time"
      //     ? "day"
      //     : body.mode === "night-time"
      //     ? "night"
      //     : body.mode;

      // await dateConflicts({
      //   date: processedBody.checkInDate,
      //   mode: mappedMode,
      // });

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

      const processedData = processBookingData(requestData);

      // Check for date conflicts
      // const conflictingBooking = await db.query.BookingsTable.findFirst({
      //   where: sql`
      //     bookingId != ${bookingId}
      //     AND bookStatus NOT IN ('cancelled', 'completed')
      //     AND date(checkInDate) = date(${processedData.checkInDate})
      //     AND (
      //       (${requestData.mode} = 'whole-day')
      //       OR
      //       (mode = 'whole-day')
      //       OR
      //       (mode = ${requestData.mode})
      //     )
      //   `,
      // });

      // if (conflictingBooking) {
      //   if (requestData.mode === "whole-day") {
      //     throw new BadRequestError(
      //       `Cannot make a whole-day booking as there are existing bookings on this date.`
      //     );
      //   } else if (conflictingBooking.mode === "whole-day") {
      //     throw new BadRequestError(
      //       `Cannot book on this date as it is already booked for whole day.`
      //     );
      //   } else {
      //     throw new BadRequestError(
      //       `This date is already booked for ${requestData.mode}. Please choose a different date or time mode.`
      //     );
      //   }
      // }

      // Map mode values to match accepted types in dateConflicts
      // const mappedMode =
      //   requestData.mode === "day-time"
      //     ? "day"
      //     : requestData.mode === "night-time"
      //     ? "night"
      //     : requestData.mode;

      // if (!mappedMode) {
      //   throw new BadRequestError("Mode is required and must be valid.");
      // }

      // await dateConflicts({
      //   date: processedData.checkInDate,
      //   mode: mappedMode,
      //   bookingId: bookingId.toString(),
      //   publicEntryId: undefined, // this is a Booking, so no public entry ID
      // });

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
              cancelCategory: z.enum(["natural-disaster", "others"]).optional(),
              cancelReason: z.string().optional(),
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
      const { bookStatus, cancelCategory, cancelReason } = await c.req.json();

      const existingBooking = await db
        .select()
        .from(BookingsTable)
        .where(eq(BookingsTable.bookingId, bookingId))
        .execute();

      if (!existingBooking || existingBooking.length === 0) {
        throw new NotFoundError("Booking not found");
      }

      const updated = await db.transaction(async (tx) => {
        if (bookStatus === "cancelled") {
          if (!cancelCategory) {
            throw new BadRequestError(
              "Cancel category is required for cancellation"
            );
          }

          if (
            cancelCategory === "others" &&
            (!cancelReason || cancelReason.trim() === "")
          ) {
            throw new BadRequestError(
              "Cancel Reason is required for 'others' category"
            );
          }
          // If natural disaster, process refund
          if (cancelCategory === "natural-disaster") {
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
            await db.transaction(async (tx) => {
              const refund = (
                await tx
                  .insert(RefundsTable)
                  .values({
                    bookingId: bookingId,
                    publicEntryId: null,
                    refundAmount: totalPaid * 0.5,
                    refundStatus: "pending",
                    refundReason: "Booking Cancelled due to " + cancelCategory,
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
            });
          }
        }

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "status-change",
            tableName: "BOOKING",
            recordId: bookingId,
            createdAt: new Date().toISOString(),
          })
          .execute();

        const updatedBooking = (
          await tx
            .update(BookingsTable)
            .set({
              bookStatus,
              cancelCategory:
                bookStatus === "cancelled" ? cancelCategory : null,
              cancelReason:
                bookStatus === "cancelled" ? cancelReason ?? null : null,
            })
            .where(eq(BookingsTable.bookingId, bookingId))
            .returning()
            .execute()
        )[0];

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
