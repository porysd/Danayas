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
import { BadRequestError, NotFoundError } from "../utils/errors";
import { CatalogAddOnDTO } from "../dto/catalogAddOnDTO";

export default new OpenAPIHono()
  .openapi(
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
  )
  .openapi(
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
        const parsed = CreateBookingAddOnDTO.parse(await c.req.json());
        const { bookingId, catalogAddOnId } = parsed;

        const selectedBooking = await db
          .select({ totalAmount: BookingsTable.totalAmount })
          .from(BookingsTable)
          .where(eq(BookingsTable.bookingId, bookingId))
          .then((rows) => rows[0]);

        if (!selectedBooking) {
          throw new NotFoundError("Booking not found.");
        }

        const selectedCatalogAddOn = await db
          .select({ price: CatalogAddOnsTable.price })
          .from(CatalogAddOnsTable)
          .where(eq(CatalogAddOnsTable.catalogAddOnId, catalogAddOnId))
          .then((rows) => rows[0]);

        if (!selectedCatalogAddOn) {
          throw new NotFoundError("Catalog add-on not found.");
        }

        const price = selectedCatalogAddOn.price;

        const created = (
          await db
            .insert(BookingAddOnsTable)
            .values({
              ...parsed,
              price: price,
            })
            .returning()
            .execute()
        )[0];

        const updatedTotalAmount = selectedBooking.totalAmount + price;

        await db
          .update(BookingsTable)
          .set({ totalAmount: updatedTotalAmount })
          .where(eq(BookingsTable.bookingId, bookingId))
          .execute();

        return c.json(BookingAddOnDTO.parse(created), 201);
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  );
