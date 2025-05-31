import "./src/polyfills/compression-polyfill";
import { config } from "dotenv";
import type { Config } from "drizzle-kit";

config({ path: "../../.env" });

export default {
  schema: "./src/schemas/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
