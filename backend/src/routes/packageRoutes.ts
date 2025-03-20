import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { like, eq } from "drizzle-orm";
import { PackagesTable } from "../schemas/Packages";
import { PackageDTO, UpdatePackageDTO, CreatePackageDTO} from "../dto/packageDTO";

export default new OpenAPIHono()
  .openapi(
    createRoute({
      tags: ["Packages"],
      summary: "Get all packages",
      method: "get",
      path: "/packages",
      request: {
        query: z.object({
          limit: z.coerce.number().nonnegative().openapi({
            example: 50,
            description: "Limit that the server will give",
          }),
          page: z.coerce.number().nonnegative().min(1).default(1).openapi({
            example: 0, 
            description: "Page to get starts from 1" 
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
      const { limit, page } = c.req.valid("query");

      const packages = await db.query.PackagesTable.findMany({
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

      const packages = await db.query.PackagesTable.findMany({
        limit,
        where: like(PackagesTable.name, `%${query}%`),
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

      const dbPackage = await db.query.PackagesTable.findFirst({
        where: eq(PackagesTable.packageId, id),
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
              schema: UpdatePackageDTO
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
      const body = c.req.valid("json");
      const updatedBody = {
        ...body,
        updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      };

      const dbPackage = (
        await db
          .update(PackagesTable)
          .set(updatedBody)
          .where(eq(PackagesTable.packageId, id))
          .returning()
          .execute()
      )[0];

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

      await db
        .delete(PackagesTable)
        .where(eq(PackagesTable.packageId, id))
        .execute();

      return c.json({
        message: "Package deleted successfully",
      });
    }
  )
  .openapi(
    createRoute({
      tags: ["Packages"],
      summary: "Create Package",
      method: "post",
      path: "/package",
      request: {
        body: {
          content: {
            "application/json": {
              schema: CreatePackageDTO,
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: PackageDTO,
            },
          },
          description: "Successful registration, redirecting to /login",
        },
      },
    }),
    async (c) => {
      const body = c.req.valid("json");

      const dbPackage = (
        await db.insert(PackagesTable).values(body).returning().execute()
      )[0];

      return c.json(dbPackage);
    }
  );
