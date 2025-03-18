import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';

export const DiscountsTable = sqliteTable('DISCOUNT_PROMOS', {
  discountPromoId: integer('discountPromoId').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  percentage: real('percentage').notNull(),
  typeFor: text('type', {enum: ['pwd', 'student', 'senior']}).notNull(),
});

// import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
// import { z } from 'zod';

// export const Discounts = sqliteTable('DISCOUNT_PROMOS', {
//   discountPromoId: integer('discountPromoId').primaryKey({ autoIncrement: true }),
//   name: text('name').notNull(),
//   percentage: real('percentage').notNull(),
//   type: text('type').notNull(),
// });


// // ZOD
// // export const DiscountSchema = z.object({
// //   discountPromoId: z.number().int().optional(),
// //   name: z.string(),
// //   percentage: z.number(),
// //   type: z.string(),
// // });
