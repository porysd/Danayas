// import { sqliteTable, integer, text, real} from 'drizzle-orm/sqlite-core';
// import { sql } from 'drizzle-orm';
// import { User } from './User';
// import { Booking } from './Booking'
// import { Payment } from  './Payment';
// import { z } from 'zod';
// import { format } from 'path';

// export const Reports = sqliteTable('REPORTS', {
//   reportId: integer('reportId').primaryKey({ autoIncrement: true }),
//   generatedBy: integer('generatedBy').references(() => User.userId).notNull(),
//   reportType: text('reportType').notNull(),
//   bookingId: integer('bookingId').references(() => Booking.bookingId), 
//   paymentId: integer('paymentId').references(() => Payment.paymentId),
//   totalRevenue: real('totalRevenue'),
//   filterType: text('filterType').notNull(),
//   createdAt: text('createdAt').notNull().default(sql`(current_timestamp)`),
// });

// // ZOD
// // export const ReportSchema = z.object({
// //   reportId: z.number().int().optional(),
// //   reportType: z.string(),
// //   generatedBy: z.number().int(),
// // });
