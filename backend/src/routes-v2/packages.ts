import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { like, eq } from "drizzle-orm";
import { Packages } from "../schemas/Packages";

export default new OpenAPIHono()
  .openapi(
    createRoute({
      tags: ["Packages"],
      summary: "Get all packages",
      method: "get",
      path: "/",
      request: {
        query: z.object({
          limit: z.coerce.number().nonnegative().openapi({
            example: 50,
            description: "Limit that the server will give",
          }),
          page: z.coerce
            .number()
            .nonnegative()
            .openapi({ example: 0, description: "Page to get" }),
        }),
      },
      responses: {
        200: {
          description: "Successful registration, redirecting to /login",
        },
      },
    }),
    async (c) => {
      const { limit, page } = c.req.valid("query");

      const packages = await db.query.Packages.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      return c.json({
        total: packages.length,
        items: packages,
      });
    }
  )
  .openapi(
    createRoute({
      tags: ["Packages"],
      summary: "Search packages",
      method: "get",
      path: "/search",
      request: {
        query: z.object({
          limit: z.coerce.number().nonnegative().openapi({
            example: 50,
            description: "Limit that the server will give",
          }),
          query: z.string().openapi({
            example: "Cruz Package",
            description: "Search query",
          }),
        }),
      },
      responses: {
        200: {
          description: "Successful registration, redirecting to /login",
        },
      },
    }),
    async (c) => {
      const { limit, query } = c.req.valid("query");

      const packages = await db.query.Packages.findMany({
        limit,
        where: like(Packages.name, `%${query}%`),
      });

      return c.json({
        total: packages.length,
        items: packages,
      });
    }
  )
  .openapi(
    createRoute({
      tags: ["Packages"],
      summary: "Get specific package",
      method: "get",
      path: "/:id",
      request: {
        params: z.object({
          id: z.coerce.number().openapi({ description: "Id to find" }),
        }),
      },
      responses: {
        200: {
          description: "Successful registration, redirecting to /login",
        },
        404: {
          description: "Successful registration, redirecting to /login",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");

      const dbPackage = await db.query.Packages.findFirst({
        where: eq(Packages.packageId, id),
      });

      if (!dbPackage) return c.json({ error: "Package not found" }, 404);

      return c.json(dbPackage);
    }
  )
  .openapi(
    createRoute({
      tags: ["Packages"],
      summary: "Update Package",
      method: "patch",
      path: "/:id",
      request: {
        params: z.object({
          id: z.coerce.number().openapi({ description: "Id to find" }),
        }),
        body: {
          content: {
            "application/json": {
              schema: z.object({
                name: z.string(),
                price: z.number(),
                description: z.string(),
                status: z.enum(['active', 'inactive', 'coming-soon', 'sold-out']),
              }).partial(),
            },
          },
        },
      },
      responses: {
        200: {
          description: "Successful registration, redirecting to /login",
        },
        404: {
          description: "Successful registration, redirecting to /login",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const payload =  c.req.valid("json");

      const dbPackage = (await db.update(Packages).set(payload).where(eq(Packages.packageId, id)).returning().execute())[0]

      return c.json(dbPackage);
    }
  )
  .openapi(
    createRoute({
      tags: ["Packages"],
      summary: "Delete Package",
      method: "delete",
      path: "/:id",
      request: {
        params: z.object({
          id: z.coerce.number().openapi({ description: "Id to find" }),
        }),
      },
      responses: {
        200: {
          description: "Successful registration, redirecting to /login",
        },
        404: {
          description: "Successful registration, redirecting to /login",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      
      await db.delete(Packages).where(eq(Packages.packageId, id)).execute()

      return c.json({
        message:"Package deleted successfully"
      });
    }
  )
  .openapi(
    createRoute({
      tags: ["Packages"],
      summary: "Create Package",
      method: "post",
      path: "/:id",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                name: z.string(),
                price: z.number(),
                description: z.string(),
                status: z.enum(['active', 'inactive', 'coming-soon', 'sold-out']),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: "Successful registration, redirecting to /login",
        },
      },
    }),
    async (c) => {
      const payload = c.req.valid("json");

      const dbPackage = (await db.insert(Packages).values(payload).returning().execute())[0];

      return c.json(dbPackage);
    }
  );
