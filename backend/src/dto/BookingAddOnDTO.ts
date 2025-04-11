// export const AddOnsTable = sqliteTable('BOOKING_ADD_ONS', {
//   addOnId: integer('addOnId').primaryKey({ autoIncrement: true }),
//   bookingId: integer('bookingId').references(() => BookingsTable.bookingId).notNull(),
//   catalogAddOnId: integer('bookingId').references(() => catalogAddOnsTable.catalogAddOnId).notNull(),
//   totalPrice: real('totalPrice').notNull(),
// });

import { z } from "@hono/zod-openapi";

export const BookingAddOnDTO = z.object({
  bookingAddOnId: z.number().int().openapi({
    description: "The ID of the catalog add-on",
    example: 1,
  }),
  bookingId: z.number().int().openapi({
    description: "The ID of the booking",
    example: 1,
  }),
  catalogAddOnId: z.number().int().openapi({
    description: "The ID of the catalog add-on",
    example: 1,
  }),
  price: z.number().openapi({
    description: "Price of the add on",
    example: 500,
  }),
  createdAt: z.string().openapi({
    description: "The date when the booking was created",
    example: new Date().toISOString(),
  }),
});

export const CreateBookingAddOnDTO = BookingAddOnDTO.omit({
  bookingAddOnId: true,
  createdAt: true,
  price: true,
});

export const UpdateBookingAddOnDTO = BookingAddOnDTO.omit({
  bookingAddOnId: true,
  createdAt: true,
  price: true,
}).partial();
