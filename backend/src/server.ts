// Hono Imports
import { routes } from "./routes/routes";
import { logger } from "hono/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { authMiddleware } from "./middlewares/authMiddleware";
import { cors } from "hono/cors";
import { errorHandler } from "./middlewares/errorHandler";

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
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowHeaders: ["Content-Type", "Authorization"],
    })
  )
  .onError(errorHandler)
  .get("/", (c) => {
    return c.json({ message: "Working!" });
  });

//For authentication
//app.use('/users/*', authMiddleware);

routes.forEach(({ path, handler }) => {
  app.route(path, handler);
});

Bun.serve({
  port: 3000,
  fetch: app.fetch,
});

console.log("INFO", "listening to port: http://localhost:3000/scalar");
