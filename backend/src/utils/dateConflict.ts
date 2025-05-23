import {
  PublicEntryTable,
  BookingsTable,
  BlockedDatesTable,
} from "../schemas/schema";
import { db } from "../config/database";
import { sql } from "drizzle-orm";
import { BadRequestError } from "./errors";

export async function dateConflicts({
  date,
  mode,
  bookingId,
  publicEntryId,
}: {
  date: string;
  mode: "day-time" | "night-time" | "whole-day";
  bookingId?: string | number;
  publicEntryId?: string | number;
}) {
  // Check blocked dates
  const blocked = await db.query.BlockedDatesTable.findFirst({
    where: sql`date(blockedDates) = date(${date})`,
  });

  if (blocked) {
    throw new BadRequestError(`This date is blocked: ${blocked.category}`);
  }
  console.log("Checking date conflicts for:", {
    date,
    mode,
    bookingId,
    publicEntryId,
  });

  // PublicEntry conflict
  const publicEntryConflict = await db.query.PublicEntryTable.findFirst({
    where: sql`
      ${publicEntryId ? sql`publicEntryId != ${publicEntryId} AND` : sql``}
      status NOT IN ('cancelled', 'completed')
      AND date(entryDate) = date(${date})
    `,
  });

  if (publicEntryConflict) {
    throw new BadRequestError(
      `This date is already booked for ${mode}. Please choose a different date or time mode.`
    );
  }

  // Booking conflict
  const bookingConflict = await db.query.BookingsTable.findFirst({
    where: sql`
      ${bookingId ? sql`bookingId != ${bookingId} AND` : sql``}
      bookStatus NOT IN ('cancelled', 'completed')
      AND date(checkInDate) = date(${date})
      AND (
        (${mode} = 'whole-day')
        OR
        (mode = 'whole-day')
        OR
        (mode = ${mode})
      )
    `,
  });

  if (bookingConflict) {
    if (mode === "whole-day") {
      throw new BadRequestError(
        `Cannot make a whole-day booking as there are existing bookings on this date.`
      );
    } else if (bookingConflict.mode === "whole-day") {
      throw new BadRequestError(
        `Cannot book on this date as it is already booked for whole day.`
      );
    } else {
      throw new BadRequestError(
        `This date is already booked for ${mode}. Please choose a different date or time mode.`
      );
    }
  }
}
