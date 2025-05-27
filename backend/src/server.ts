// Hono Imports
import { routes } from "./routes/routes";
import { logger } from "hono/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { authMiddleware } from "./middlewares/authMiddleware";
import { cors } from "hono/cors";
import { errorHandler } from "./middlewares/errorHandler";
import { serveStatic } from "hono/bun";
import { startExpireBookingJob } from "./cron/expiredBookings";

const app = new OpenAPIHono()
  .doc("/openapi", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Reservation Danayas",
    },
  })
  .use("*", logger())
  .get(
    "/scalar",
    apiReference({
      theme: "saturn",
      spec: { url: "/openapi" },
      cdn: "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.80",
    })
  )
  .use(
    cors({
      origin: "http://localhost:4000",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use("/PaymentImages/*", logger())
  .use("/PaymentImages/*", serveStatic({ root: "./public" }))

  .use("/PackageImages/*", logger())
  .use("/PackageImages/*", serveStatic({ root: "./public" }))
  .onError(errorHandler)
  .get("/", (c) => {
    return c.json({ message: "Working!" });
  });

//For authentication
//app.use('/users/*', authMiddleware);

routes.forEach(({ path, handler }) => {
  app.route(path, handler);
});

startExpireBookingJob();

Bun.serve({
  port: 3000,
  fetch: app.fetch,
});

console.log("INFO", "listening to port: http://localhost:3000/scalar");
