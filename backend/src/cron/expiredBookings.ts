import cron from "node-cron";
import { db } from "../config/database";
import { eq, and, lt } from "drizzle-orm";
import { BookingsTable } from "../schemas/schema";

export const startExpireBookingJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Checking for expired reserved bookings...");

    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - 2); // 2 days grace period

    const expiredBookings = await db
      .select()
      .from(BookingsTable)
      .where(
        and(
          lt(BookingsTable.checkInDate, cutoffDate.toISOString()),
          eq(BookingsTable.bookStatus, "reserved"),
          eq(BookingsTable.forfeited, 0)
        )
      );

    for (const booking of expiredBookings) {
      await db
        .update(BookingsTable)
        .set({ bookStatus: "cancelled", forfeited: 1 })
        .where(eq(BookingsTable.bookingId, booking.bookingId));

      console.log(
        `[CRON] Cancelled and forfeited booking ID: ${booking.bookingId}`
      );
    }

    console.log("[CRON] Expired reserved booking job done.");
  });
};
