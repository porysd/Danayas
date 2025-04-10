import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const DiscountsTable = sqliteTable('DISCOUNTS', {
  discountId: integer('discountId').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  percentage: real('percentage').notNull(),
  typeFor: text('type').notNull(), // pwd, senior, student, etc.
  status: text('status').notNull() // active, inactive 
});


// import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// export const DiscountsTable = sqliteTable('DISCOUNT_PROMOS', {
//   discountPromoId: integer('discountPromoId').primaryKey({ autoIncrement: true }),
//   name: text('name').notNull(),
//   percentage: real('percentage').notNull(),
//   typeFor: text('type', {enum: ['pwd', 'student', 'senior']}).notNull(),
// });