import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { BookingsTable } from './Booking';
import { CatalogAddOnsTable } from './CatalogAddOns';
import { sql } from 'drizzle-orm';

export const BookingAddOnsTable = sqliteTable('BOOKING_ADD_ONS', {
  bookingAddOnId: integer('addOnId').primaryKey({ autoIncrement: true }),
  bookingId: integer('bookingId').references(() => BookingsTable.bookingId).notNull(),
  catalogAddOnId: integer('bookingId').references(() => CatalogAddOnsTable.catalogAddOnId).notNull(),
  totalPrice: real('totalPrice').notNull(),
  createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
});
