import { and, eq } from "drizzle-orm";
import { db } from "../config/database";
import { PublicEntryRateTable } from "../schemas/schema";

export async function getActiveRateId(
  category: "adult" | "kid",
  mode: "day-time" | "night-time"
) {
  // Try preferred mode first
  const preferred = await db.query.PublicEntryRateTable.findFirst({
    where: and(
      eq(PublicEntryRateTable.category, category),
      eq(PublicEntryRateTable.mode, mode),
      eq(PublicEntryRateTable.isActive, true)
    ),
  });

  if (preferred) return preferred.rateId;

  // Fallback to other mode
  const fallbackMode = mode === "day-time" ? "night-time" : "day-time";

  const fallback = await db.query.PublicEntryRateTable.findFirst({
    where: and(
      eq(PublicEntryRateTable.category, category),
      eq(PublicEntryRateTable.mode, fallbackMode),
      eq(PublicEntryRateTable.isActive, true)
    ),
  });

  if (fallback) return fallback.rateId;

  throw new Error(`No active rate found for category ${category}`);
}
