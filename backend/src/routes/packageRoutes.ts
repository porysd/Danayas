import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { like, eq } from "drizzle-orm";
import { PackagesTable } from "../schemas/Packages";
import { PackageDTO, UpdatePackageDTO, CreatePackageDTO} from "../dto/packageDTO";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";

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
          page: z.coerce.number().nonnegative().min(1).default(1).openapi({
            example: 0, 
            description: "Page to get starts from 1" 
          }),
        }),
      },
      responses: {
        200: {
          description: "Retrieves all packages successfully",
        },
        404: {
          description: "No packages found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try{
        const { limit, page } = c.req.valid("query");

        const packages = await db.query.PackagesTable.findMany({
          limit,
          offset: (page - 1) * limit,
        });

        if(!packages || packages.length === 0){
          throw new NotFoundError("No packages found.");
        }

        return c.json({
          total: packages.length,
          items: packages,
        });
      } catch (err){
        return errorHandler(err, c);
      }
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
          description: "Packages found successfully",
        },
        400: {
          description: "Invalid limit value or missing query",
        },
        404: {
          description: "No packages found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try{
        const { limit, query } = c.req.valid("query");

        if(limit < 1){
          throw new BadRequestError("Limit must be greater than 0.");
        }

        if(!query){
          throw new BadRequestError("Query is required.");
        }

        const packages = await db.query.PackagesTable.findMany({
          where: like(PackagesTable.name, `%${query}%`),
          limit,
        });

        if(!packages || packages.length === 0){
          throw new NotFoundError("No packages found.");
        }

        return c.json({
          total: packages.length,
          items: packages,
        });
      } catch(err){
        return errorHandler(err, c);
      }
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
          description: "Successful package retrieval",
        },
        404: {
          description: "Package not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try{
        const { id } = c.req.valid("param");

        const dbPackage = await db.query.PackagesTable.findFirst({
          where: eq(PackagesTable.packageId, id),
        });

        if(!dbPackage){
          throw new NotFoundError("Package not found");
        }

        return c.json(dbPackage);
      } catch (err){
        return errorHandler(err, c);
      }
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
          description: "Package updated successfully",
        },
        400: {
          description: "Invalid input data for update",
        },
        404: {
          description: "Package not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try{
        const { id } = c.req.valid("param");
        const body = c.req.valid("json");

	      const updatedBody = {
          ...body,
          updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      	};

        const dbPackage = await db.query.PackagesTable.findFirst({
          where: eq(PackagesTable.packageId, id),
        });

        if(!dbPackage){
          throw new NotFoundError("Package not found");
        }
	
        await db
          .update(PackagesTable)
          .set(updatedBody)
          .where(eq(PackagesTable.packageId, id))
	        .returning()
          .execute()

        return c.json({
          message: "Package updated successfully",
        });
      } catch(err){
        return errorHandler(err, c);
      }
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
          id: z.coerce.number().openapi({ description: "ID to delete" }),
        }),
      },
      responses: {
        200: {
          description: "Package deleted successfully",
        },
        404: {
          description: "Package not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try{
        const { id } = c.req.valid("param");

        const dbPackage = await db.query.PackagesTable.findFirst({
          where: eq(PackagesTable.packageId, id),
        });

        if(!dbPackage){
          throw new NotFoundError("Package not found");
        }

        await db
          .delete(PackagesTable)
          .where(eq(PackagesTable.packageId, id))
          .execute();

        return c.json({
          message: "Package deleted successfully",
        });
      } catch(err){
        return errorHandler(err, c);
      }
    }
  )
  .openapi(
    createRoute({
      tags: ["Packages"],
      summary: "Create Package",
      method: "post",
      path: "/",
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
        201: {
          content: {
            "application/json": {
              schema: PackageDTO,
            },
          },
          description: "Package Created",
        },
        400: {
          description: "Invalid package data",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try{
        const body = c.req.valid("json");

        const dbPackage = await db.query.PackagesTable.findFirst({
          where: eq(PackagesTable.name, body.name),
        });

        if(dbPackage){
          throw new ConflictError("Package already exists.");
        }

        const packageId = await db.insert(PackagesTable).values(body).returning().execute();

        return c.json({
          message: "Package created successfully",
          packageId: packageId[0].packageId,
        }, 201);
      } catch(err){
        return errorHandler(err, c);
      }
    }
  );