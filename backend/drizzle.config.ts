// import "./src/polyfills/compression-polyfill";
// import { config } from "dotenv";
// import type { Config } from "drizzle-kit";

// config({ path: "../../.env" });

// export default {
//   schema: "./src/schemas/schema.ts",
//   out: "./drizzle",
//   dialect: "turso",
//   dbCredentials: {
//     url: process.env.TURSO_DATABASE_URL!,
//     authToken: process.env.TURSO_AUTH_TOKEN,
//   },
// } satisfies Config;

import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '../../.env' });

export default defineConfig({
  out: './drizzle',
  schema: './src/schemas/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: `file:${process.env.DB_FILE_NAME}`, 
  },
});