import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { BookingsTable } from "../schemas/Booking";
import {
  BookingDTO,
  CreateBookingDTO,
  UpdateBookingDTO,
} from "../dto/bookingDTO";
import { DiscountsTable } from "../schemas/Discounts";
import { eq } from "drizzle-orm";
import { processBookingData } from "../utils/dateHelpers";
import { PackagesTable } from "../schemas/Packages";
import { UsersTable } from '../schemas/User';
import { fi } from "@faker-js/faker";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";

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

        if(!hasPermission) {
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

        // Remove this code:
        // if (!bookings || bookings.length === 0) {
        //   throw new NotFoundError("No bookings found.");
        // }

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
  )

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

        if(!hasPermission) {
          throw new ForbiddenError("No permission to get booking.");
        }

        const { id } = c.req.valid("param");
        const booking = await db.query.BookingsTable.findFirst({
          where: eq(BookingsTable.bookingId, id),
        });

        if (!booking) {
          throw new NotFoundError("Booking not found.");
        }

        return c.json(BookingDTO.parse(booking));
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )

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

        if(!hasPermission) {
          throw new ForbiddenError("No permission to create booking.");
        }

        const body = c.req.valid("json");

        const reservationType = body.reservationType || "online";

        let userDetails = null;
        let createdByUser = null;

        if (reservationType === "online") {
          if (!body.userId) {
            throw new BadRequestError("Online reservations require a user account.");
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
            throw new BadRequestError("Walk-in bookings must be created by staff or admin.");
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
        const selectedPackage = await db
          .select({ price: PackagesTable.price })
          .from(PackagesTable)
          .where(eq(PackagesTable.packageId, packageId))
          .then((rows) => rows[0]);

        if (!selectedPackage) {
          throw new BadRequestError("Invalid package ID");
        }

        let discountPercent = 0;

        if (discountId) {
          const SelectedDiscount = await db
            .select({ percentage: DiscountsTable.percentage })
            .from(DiscountsTable)
            .where(eq(DiscountsTable.discountId, discountId))
            .then((rows) => rows[0]);

          discountPercent = SelectedDiscount.percentage ?? 0;
        }

        const totalAmount =
          selectedPackage.price - selectedPackage.price * discountPercent;

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
        };

        const insertedBooking = (
          await db
            .insert(BookingsTable)
            .values(processedBody)
            .returning()
            .execute()
        )[0];
        return c.json(
          {
            ...insertedBooking,
            // mode: insertedBooking.mode as "day-time" | "night-time" | "whole-day",
            // paymentTerms: insertedBooking.paymentTerms as "installment" | "full-payment",
            // bookStatus: insertedBooking.bookStatus as "pending" | "confirmed" | "cancelled" | "completed" | "rescheduled",
            // reservationType: insertedBooking.reservationType as "online" | "walk-in",
            catering: insertedBooking.catering === 1,
            // catering: insertedBooking.catering === 1 ? 1 : 0 as 0 | 1,
          },
          201
        );
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )
  
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

        if(!hasPermission) {
          throw new ForbiddenError("No permission to update booking.");
        }

        const bookingId = Number(c.req.param("id"));

        if (isNaN(bookingId)) {
          throw new BadRequestError("Invalid booking ID.");
        }

        const requestData = UpdateBookingDTO.parse(await c.req.json());
        const processedData = processBookingData(requestData);

        const updatedBooking = await db
          .update(BookingsTable)
          .set(processedData)
          .where(eq(BookingsTable.bookingId, bookingId))
          .returning()
          .execute();

        if (updatedBooking.length === 0) {
          throw new NotFoundError("Booking not found.");
        }

        return c.json({
          status: "success",
          message: "Booking updated successfully.",
          updatedBooking: updatedBooking[0],
        });
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )

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
                  "confirmed",
                  "cancelled",
                  "completed",
                ]),
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

        if(!hasPermission) {
          throw new ForbiddenError("No permission to update booking status.");
        }

        const bookingId = Number(c.req.param("id"));
        const { bookStatus } = await c.req.json();

        const existingBooking = await db
          .select()
          .from(BookingsTable)
          .where(eq(BookingsTable.bookingId, bookingId))
          .execute();

        if (!existingBooking || existingBooking.length === 0) {
          throw new NotFoundError("Booking not found");
        }

        const updatedBooking = await db
          .update(BookingsTable)
          .set({ bookStatus })
          .where(eq(BookingsTable.bookingId, bookingId))
          .returning()
          .execute();

        return c.json(
          {
            message: "Booking status updated",
            bookStatus: updatedBooking[0].bookStatus,
          },
          200
        );
      } catch (error) {
        return errorHandler(error, c);
      }
    }
  )

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

        if(!hasPermission) {
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

        await db
          .delete(BookingsTable)
          .where(eq(BookingsTable.bookingId, bookingId))
          .execute();

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