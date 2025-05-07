import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const DiscountsTable = sqliteTable('DISCOUNTS', {
  discountId: integer('discountId').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  percentage: real('percentage').notNull(),
  typeFor: text('typeFor').notNull(), // pwd, senior, student, etc.
  status: text('status').notNull(), // active, inactive 
  createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
});


// import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// export const DiscountsTable = sqliteTable('DISCOUNT_PROMOS', {
//   discountPromoId: integer('discountPromoId').primaryKey({ autoIncrement: true }),
//   name: text('name').notNull(),
//   percentage: real('percentage').notNull(),
//   typeFor: text('type', {enum: ['pwd', 'student', 'senior']}).notNull(),
// });