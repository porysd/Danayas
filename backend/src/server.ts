// Hono Imports
import { routes } from './routes/routes'
import { logger } from 'hono/logger'
import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import seedRoles from "./config/seed";
import authentication from './routes/authRoutes';
import { authMiddleware } from './middlewares/authMiddleware';

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

//For authentication
//app.use('/users/*', authMiddleware);

routes.forEach(({ path, handler }) => {
  app.route(path, handler);
});


app.get('/', (c) => c.text('Localhost:3000 works O:'));
app.post;
export default {
  port: 3000,
  fetch: app.fetch,
};

// app.use(
//   "*", // Intercepts all incoming requests
//   async (c: Context, next) => {
//     if (c.req.path === "/login") {
//       return next(); // Skip auth check for login
//     }
//     return jwtAuthMiddleware(c, next);
//   }
// );


