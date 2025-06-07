import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { like, eq } from "drizzle-orm";
import { PackagesTable } from "../schemas/Packages";
import {
  PackageDTO,
  UpdatePackageDTO,
  CreatePackageDTO,
} from "../dto/packageDTO";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import type { AuthContext } from "../types";
import { verifyPermission } from "../utils/permissionUtils";
import { AuditLogsTable } from "../schemas/schema";
import fs from "fs/promises";
import path from "path";

const packageRoutes = new OpenAPIHono<AuthContext>();

packageRoutes.openapi(
  createRoute({
    tags: ["Packages"],
    summary: "Get all packages",
    method: "get",
    path: "/",
    request: {
      query: z.object({
        limit: z.coerce.number().nonnegative().min(1).default(20).openapi({
          example: 50,
          description: "Limit that the server will give",
        }),
        page: z.coerce.number().nonnegative().min(1).default(1).openapi({
          example: 0,
          description: "Page to get starts from 1",
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
    try {
      // const userId = c.get("userId");
      // const hasPermission = await verifyPermission(userId, "PACKAGES", "read");

      // if (!hasPermission) {
      //   throw new ForbiddenError("No permission to get all packages.");
      // }

      const { limit, page } = c.req.valid("query");

      const packages = await db.query.PackagesTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      return c.json({
        total: packages.length,
        items: packages,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

packageRoutes.openapi(
  createRoute({
    tags: ["Packages"],
    summary: "Get common Packages",
    method: "get",
    path: "/packages",
    responses: {
      200: { description: "Common Packages" },
      404: { description: "No common packages found" },
      500: { description: "Internal sever error" },
    },
  }),
  async (c) => {
    try {
      // Example: get packages where isPromo is false and status is active
      const packages = await db.query.PackagesTable.findMany({
        where: (fields, { and, eq }) =>
          and(eq(fields.isPromo, false), eq(fields.status, "active")),
      });

      if (!packages || packages.length === 0) {
        throw new NotFoundError("No common packages found");
      }

      return c.json({
        total: packages.length,
        items: packages,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

packageRoutes.use("/*", authMiddleware);

packageRoutes.openapi(
  createRoute({
    tags: ["Packages"],
    summary: "Search packages",
    method: "get",
    path: "/search",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
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
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PACKAGES", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to search packages.");
      }

      const { limit, query } = c.req.valid("query");

      if (limit < 1) {
        throw new BadRequestError("Limit must be greater than 0.");
      }

      if (!query) {
        throw new BadRequestError("Query is required.");
      }

      const packages = await db.query.PackagesTable.findMany({
        where: like(PackagesTable.name, `%${query}%`),
        limit,
      });

      if (!packages || packages.length === 0) {
        throw new NotFoundError("No packages found.");
      }

      const allPackages = packages.map((packages) => {
        try {
          return PackageDTO.parse(packages);
        } catch (err) {
          throw new BadRequestError("Invalid package data.");
        }
      });

      return c.json({
        total: packages.length,
        items: allPackages,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

packageRoutes.openapi(
  createRoute({
    tags: ["Packages"],
    summary: "Get specific package",
    method: "get",
    path: "/:id",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      params: z.object({
        id: z.coerce.number().openapi({ description: "Id to find" }),
      }),
    },
    responses: {
      200: {
        description: "Successful package retrieval",
      },
    },
    404: {
      description: "Package not found",
    },
    500: {
      description: "Internal server error",
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PACKAGES", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get package.");
      }

      const { id } = c.req.valid("param");

      const dbPackage = await db.query.PackagesTable.findFirst({
        where: eq(PackagesTable.packageId, id),
      });

      if (!dbPackage) {
        throw new NotFoundError("Package not found");
      }

      return c.json(PackageDTO.parse(dbPackage));
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

packageRoutes.openapi(
  createRoute({
    tags: ["Packages"],
    summary: "Update Package",
    method: "patch",
    path: "/:id",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      params: z.object({
        id: z.coerce.number().openapi({ description: "Id to find" }),
      }),
      body: {
        content: {
          "multipart/form-data": {
            schema: UpdatePackageDTO,
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
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PACKAGES",
        "update"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update package.");
      }

      const packageId = Number(c.req.param("id"));

      const packages = await db.query.PackagesTable.findFirst({
        where: eq(PackagesTable.packageId, packageId),
      });

      if (!packages) {
        throw new NotFoundError("Package not found.");
      }

      const body = await c.req.parseBody();
      const file = body["imageUrl"] as File;
      let imageUrl = null;

      const parsed = UpdatePackageDTO.parse(body);

      if (file) {
        const allowedMimeTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/jfif",
        ];

        if (!allowedMimeTypes.includes(file.type)) {
          throw new BadRequestError(
            "Invalid file type, Only Jpeg, Png, and Jpg are allowed"
          );
        }

        const uploadDir = path.join(process.cwd(), "public", "PackageImages");
        await fs.mkdir(uploadDir, { recursive: true });

        const uniqueFileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, uniqueFileName);

        const fileBuffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(fileBuffer));

        parsed.imageUrl = `/PackageImages/${uniqueFileName}`;
      } else {
        parsed.imageUrl = packages.imageUrl;
      }

      const updatedBody = {
        ...parsed,
        updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      };

      const updated = await db.transaction(async (tx) => {
        const dbPackage = (
          await tx
            .update(PackagesTable)
            .set(updatedBody)
            .where(eq(PackagesTable.packageId, packageId))
            .returning()
            .execute()
        )[0];

        if (!dbPackage) {
          throw new NotFoundError("Package not found");
        }

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "update",
            tableName: "PACKAGES",
            recordId: dbPackage.packageId,
            data: JSON.stringify(dbPackage),
            remarks: "Package updated",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return dbPackage;
      });

      return c.json({
        ...updated,
        imageUrl: updated.imageUrl || "",
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

packageRoutes.openapi(
  createRoute({
    tags: ["Packages"],
    summary: "Delete Package",
    method: "delete",
    path: "/:id",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
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
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PACKAGES",
        "delete"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to delete package.");
      }

      const { id } = c.req.valid("param");

      const dbPackage = await db.query.PackagesTable.findFirst({
        where: eq(PackagesTable.packageId, id),
      });

      if (!dbPackage) {
        throw new NotFoundError("Package not found");
      }

      await db.transaction(async (tx) => {
        const deletePackage = (
          await tx
            .delete(PackagesTable)
            .where(eq(PackagesTable.packageId, id))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "delete",
            tableName: "PACKAGES",
            recordId: deletePackage.packageId,
            data: JSON.stringify(deletePackage),
            remarks: "Package deleted",
            createdAt: new Date().toISOString(),
          })
          .execute();
      });

      return c.json({
        message: "Package deleted successfully",
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

packageRoutes.openapi(
  createRoute({
    tags: ["Packages"],
    summary: "Create Package",
    method: "post",
    path: "/",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      body: {
        content: {
          "multipart/form-data": {
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
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PACKAGES",
        "create"
      );
      const formData = new FormData();
      const allowedStatuses = ["active", "inactive"];

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create package.");
      }

      const body = await c.req.parseBody();
      const file = body["imageUrl"] as File;

      for (const key in body) {
        if (key === "imageUrl") {
          formData.append("imageUrl", body[key]);
        } else {
          formData.append(key, body[key]);
        }
      }

      let imageUrl = "";

      if (file && file.size > 0) {
        const allowedMimeTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/jfif",
        ];

        if (!allowedMimeTypes.includes(file.type)) {
          throw new BadRequestError(
            "Invalid file type, Only Jpeg, Png, and Jpg are allowed"
          );
        }

        const uploadDir = path.join(process.cwd(), "public", "PackageImages");
        await fs.mkdir(uploadDir, { recursive: true });

        const uniqueFileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, uniqueFileName);

        const fileBuffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(fileBuffer));

        console.log("Save to:", filePath);
        imageUrl = `/PackageImages/${uniqueFileName}`;
      }

      // const existingPackage = await db.query.PackagesTable.findFirst({
      //   where: eq(PackagesTable.name, String(body.name)),
      // });

      // if (existingPackage) {
      //   throw new ConflictError("Package already exists.");
      // }

      const parsed = CreatePackageDTO.parse(body);

      const status = allowedStatuses.includes(parsed.status as any)
        ? (parsed.status as "active" | "inactive")
        : "inactive";

      const updatedBody = {
        ...parsed,
        status,
        imageUrl,
      };
      console.log("updatedBody.isPromo:", updatedBody.isPromo);
      console.log("FINAL isPromo going into DB:", updatedBody.isPromo);

      const created = await db.transaction(async (tx) => {
        const dbPackage = (
          await tx
            .insert(PackagesTable)
            .values(updatedBody)
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "create",
            tableName: "PACKAGES",
            recordId: dbPackage.packageId,
            data: JSON.stringify(dbPackage),
            remarks: "Package created",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return dbPackage;
      });

      return c.json(
        {
          ...created,
          imageUrl: created.imageUrl || "",
        },
        201
      );
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default packageRoutes;
