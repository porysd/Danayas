import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { PublicEntryTable } from "./PublicEntry";
import { CatalogAddOnsTable } from "./CatalogAddOns";
import { sql } from "drizzle-orm";

export const PublicEntryAddOnsTable = sqliteTable("PUBLIC_ENTRY_ADD_ONS", {
  publicAddOnId: integer("publicAddOnId").primaryKey({ autoIncrement: true }),
  publicEntryId: integer("publicEntryId")
    .references(() => PublicEntryTable.publicEntryId)
    .notNull(),
  catalogAddOnId: integer("catalogAddOnId")
    .references(() => CatalogAddOnsTable.catalogAddOnId)
    .notNull(),
  price: real("price").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
});
