// Hono Imports
import { routes } from './routes/routes'
import { logger } from 'hono/logger'
import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import authentication from './routes/authRoutes';
import { cors } from 'hono/cors';

const app = new OpenAPIHono()
  .doc('/openapi', {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Reservation Danayas',
    },
  })
  .use('*', logger())
  .get(
    '/scalar',
    apiReference({
      theme: 'saturn',
      spec: { url: "/openapi" },
      cdn: "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.80",
    })
  )  
  .use(
    cors({
      origin: 'http://localhost:5174', 
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
      allowHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .get("/", (c) => {
    return c.json({ message: "Working!" });
  }
);
  
routes.forEach(({ path, handler }) => {
  app.route(path, handler);
});

Bun.serve({
  port: 3000,
  fetch: app.fetch,
});

console.log("INFO", "listening to port: http://localhost:3000");


// app.use(
//   "*", // Intercepts all incoming requests
//   async (c: Context, next) => {
//     if (c.req.path === "/login") {
//       return next(); // Skip auth check for login
//     }
//     return jwtAuthMiddleware(c, next);
//   }
// );