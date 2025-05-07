import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { BookingsTable } from './Booking';
import { CatalogAddOnsTable } from './CatalogAddOns';
import { sql } from 'drizzle-orm';

export const BookingAddOnsTable = sqliteTable('BOOKING_ADD_ONS', {
  bookingAddOnId: integer('bookingAddOnId').primaryKey({ autoIncrement: true }),
  bookingId: integer('bookingId').references(() => BookingsTable.bookingId).notNull(),
  catalogAddOnId: integer('catalogAddOnId').references(() => CatalogAddOnsTable.catalogAddOnId).notNull(),
  price: real('price').notNull(),
  createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
});
