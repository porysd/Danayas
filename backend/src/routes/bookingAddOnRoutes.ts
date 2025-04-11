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
import { BadRequestError } from "../utils/errors";
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
        400: { description: "Bad request!" },
        500: { description: "Internal server error" },
      },
    }),
    async (c) => {
      const { limit, page } = c.req.valid("query");

      const bookingAddOns = await db.query.BookingAddOnsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allBookingAddOns = bookingAddOns.map((bookingAddOn) =>
        BookingAddOnDTO.parse(bookingAddOn)
      );

      return c.json({
        total: bookingAddOns.length,
        items: allBookingAddOns,
      });
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
          required: true,
          content: {
            "application/json": {
              schema: CreateBookingAddOnDTO,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Booking add-on created successfully",
          content: {
            "application/json": {
              schema: BookingAddOnDTO,
            },
          },
        },
      },
    }),
    async (c) => {
      const parsed = CreateBookingAddOnDTO.parse(await c.req.json());
      const { bookingId, catalogAddOnId } = parsed;

      //TODO: add error if booking is not located
      const selectedBooking = await db
        .select({ totalAmount: BookingsTable.totalAmount })
        .from(BookingsTable)
        .where(eq(BookingsTable.bookingId, bookingId))
        .then((rows) => rows[0]);

      //TODO: add error if catalog add-on is not located
      const selectedCatalogAddOn = await db
        .select({ price: CatalogAddOnsTable.price })
        .from(CatalogAddOnsTable)
        .where(eq(CatalogAddOnsTable.catalogAddOnId, catalogAddOnId))
        .then((rows) => rows[0]);

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

      const updatedBooking = await db
        .update(BookingsTable)
        .set({ totalAmount: updatedTotalAmount })
        .where(eq(BookingsTable.bookingId, bookingId))
        .returning()
        .execute();

      return c.json(BookingAddOnDTO.parse(created));
    }
  );
