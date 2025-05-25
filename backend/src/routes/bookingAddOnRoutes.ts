//     .get('/booking/addons', getBookingAddOn)
//     .post('/booking/addons', createBookingAddOn)
//     .get('/booking/addons/:id', getBookingAddOnById)
//     .put('/booking/addons/:id', updateBookingAddOn)
//     .delete('/booking/addons/:id', deleteBookingAddON);

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { BookingAddOnsTable } from "../schemas/BookingAddOns";
import {
  BookingAddOnDTO,
  CreateBookingAddOnDTO,
  UpdateBookingAddOnDTO,
} from "../dto/BookingAddOnDTO";
import { eq } from "drizzle-orm";
import { BookingsTable } from "../schemas/Booking";
import { CatalogAddOnsTable } from "../schemas/CatalogAddOns";
import { errorHandler } from "../middlewares/errorHandler";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { CatalogAddOnDTO } from "../dto/catalogAddOnDTO";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";
import { AuditLogsTable } from "../schemas/AuditLog";

const bookingAddOnRoutes = new OpenAPIHono<AuthContext>();

bookingAddOnRoutes.use("/*", authMiddleware);

bookingAddOnRoutes.openapi(
  createRoute({
    tags: ["Booking Add-Ons"],
    summary: "Get all booking add-ons",
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
            schema: BookingAddOnDTO.array(),
          },
        },
        description: "Retrieve all booking add-ons",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Booking add-ons not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "BOOKING_ADD_ONS",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get bookings.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const bookingAddOns = await db.query.BookingAddOnsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allBookingAddOns = bookingAddOns.map((bookingAddOn) => {
        try {
          return BookingAddOnDTO.parse(bookingAddOn);
        } catch (err) {
          throw new BadRequestError("Invalid booking add-on data.");
        }
      });

      return c.json({
        total: bookingAddOns.length,
        items: allBookingAddOns,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

bookingAddOnRoutes.openapi(
  createRoute({
    tags: ["Booking Add-Ons"],
    summary: "Create a new booking add-on",
    method: "post",
    path: "/",
    request: {
      body: {
        description: "Booking add-on data",
        required: true,
        content: {
          "application/json": {
            schema: CreateBookingAddOnDTO,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Booking add-on created successfully",
        content: {
          "application/json": {
            schema: BookingAddOnDTO,
          },
        },
      },
      400: {
        description: "Invalid booking add-on data",
      },
      404: {
        description: "Booking or catalog add-on not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "BOOKING_ADD_ONS",
        "create"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create booking add-on.");
      }

      const parsed = CreateBookingAddOnDTO.parse(await c.req.json());
      const { bookingId, catalogAddOnId } = parsed;

      const selectedBooking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, bookingId),
      });

      if (!selectedBooking) {
        throw new NotFoundError("Booking not found.");
      }

      if (selectedBooking.bookStatus === "cancelled") {
        return c.json({ error: "Booking is already cancelled" }, 400);
      }

      const selectedCatalogAddOn = await db.query.CatalogAddOnsTable.findFirst({
        where: eq(CatalogAddOnsTable.catalogAddOnId, catalogAddOnId),
      });

      if (!selectedCatalogAddOn) {
        throw new NotFoundError("Catalog add-on not found.");
      }

      const price = selectedCatalogAddOn.price;

      const created = await db.transaction(async (tx) => {
        const createBookingAddon = (
          await tx
            .insert(BookingAddOnsTable)
            .values({
              ...parsed,
              price: price,
            })
            .returning()
            .execute()
        )[0];

        const updatedTotalAmount = selectedBooking.totalAmount + price;

        const updateBooking = (
          await tx
            .update(BookingsTable)
            .set({
              totalAmount: updatedTotalAmount,
              bookingPaymentStatus: "partially-paid",
              remainingBalance: selectedBooking.remainingBalance + price,
            })
            .where(eq(BookingsTable.bookingId, bookingId))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "update",
            tableName: "BOOKINGS",
            recordId: bookingId,
            data: JSON.stringify({
              totalAmount: updateBooking.totalAmount,
              remainingBalance: updateBooking.remainingBalance,
              bookingPaymentStatus: updateBooking.bookingPaymentStatus,
            }),
            remarks: "Booking updated due to add-on creation",
            createdAt: new Date().toISOString(),
          })
          .execute();

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "create",
            tableName: "BOOKING_ADD_ONS",
            recordId: createBookingAddon.bookingAddOnId,
            data: JSON.stringify(BookingAddOnDTO.parse(createBookingAddon)),
            remarks: "Booking add-on created",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return createBookingAddon;
      });

      return c.json(BookingAddOnDTO.parse(created), 201);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

//TODO: Maybe implement the getBookingAddOnById, updateBookingAddOn, and deleteBookingAddON functions
export default bookingAddOnRoutes;
