// export const AddOnsTable = sqliteTable('BOOKING_ADD_ONS', {
//   addOnId: integer('addOnId').primaryKey({ autoIncrement: true }),
//   bookingId: integer('bookingId').references(() => BookingsTable.bookingId).notNull(),
//   catalogAddOnId: integer('bookingId').references(() => catalogAddOnsTable.catalogAddOnId).notNull(),
//   totalPrice: real('totalPrice').notNull(),
// });

import { z } from "@hono/zod-openapi";

export const CatalogAddOnDTO = z.object({
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
  quantity: z.number().openapi({
    description: "Quantity of the add-on",
    example: 5,
  }),
  status: z.enum(["active", "inactive"]).openapi({
    description: "Status of the discount",
    example: "active",
  }),
  createdAt: z.string().openapi({
    description: "The date when the booking was created",
    example: new Date().toISOString(),
  }),
});

export const CreateCatalogAddOnDTO = CatalogAddOnDTO.omit({
  bookingAddOnId: true,
  createdAt: true,
});

export const UpdateCatalogAddOnDTO = CatalogAddOnDTO.omit({
  bookingAddOnId: true,
  createdAt: true,
}).partial();
