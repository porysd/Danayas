// import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
// import { ne, sql } from "drizzle-orm";
// import { z } from "zod";
// import { format } from "path";
// import { BookingsTable } from "./Booking";
// import { PaymentsTable } from "./Payment";
// import { UsersTable } from "./User";

// export const Reports = sqliteTable("REPORTS", {
//   reportId: integer("reportId").primaryKey({ autoIncrement: true }),
//   fromDate: text("fromDate").notNull(),
//   toDate: text("toDate").notNull(),
//   totalBookings: integer("totalBookings").notNull(),
//   totalPayments: integer("totalPayments").notNull(),
//   totalRefunds: integer("totalRefunds").notNull(),
//   netRevenue: real("netRevenue").notNull(),
//   paymentMethodBreakdown: text("paymentMethodBreakdown").notNull(),
//   bookingStatusBreakdown: text("bookingStatusBreakdown").notNull(),
//   generatedBy: integer("generatedBy").references(() => UsersTable.userId).notNull(),
//   createdAt: text("createdAt").notNull().default(sql`(current_timestamp)`),
// });

// // ZOD
// // export const ReportSchema = z.object({
// //   reportId: z.number().int().optional(),
// //   reportType: z.string(),
// //   generatedBy: z.number().int(),
// // });
