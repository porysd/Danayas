import { OpenAPIHono } from "@hono/zod-openapi";
import authentication from "./authentication";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import db from "../config/database";
import { apiReference } from "@scalar/hono-api-reference";

type Env = {
  Variables: {
    db: BunSQLiteDatabase;
  };
};

const app = new OpenAPIHono<Env>()
  .doc("/openapi", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Reservation management",
    },
  })
  .get(
    "/scalar",
    apiReference({
      theme: "kepler",
      spec: { url: "/openapi" },
      cdn: "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.80",
    }),
  )
  .route("/auth", authentication);

Bun.serve({
  port: 3001,
  fetch: app.fetch,
});

console.log("INFO", "listening to port: 3001");
