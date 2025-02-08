import { sqliteTable, text, integer, check} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { User } from "./User";
import { Packages } from "./Packages";

export const Schedule = sqliteTable("schedule", {
  id: integer("id").primaryKey({autoIncrement: true}),
  userId: integer("userId").references(() => User.id),
  mode: text("mode").notNull(),
  startDate: text("startDate").notNull(),
  endDate: text("endDate").notNull(),
  packageId: integer("packageId").references(() => Packages.id).notNull()
},

(table) => [
    check("modeCheck", sql`${table.mode} in ("day", "night")`)
]
);
