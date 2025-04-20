import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CreateUserDTO, UpdateUserDTO, GetUserDTO } from "../dto/userDTO";
import db from "../config/database";
import { UsersTable } from "../schemas/User";
import { eq, like, or } from "drizzle-orm";
import { BadRequestError, NotFoundError, ConflictError, ForbiddenError } from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import type { AuthContext } from "../types";
import { verifyPermission } from "../utils/permissionUtils";

const userRoutes = new OpenAPIHono<AuthContext>();

userRoutes.use("/*", authMiddleware);

userRoutes.openapi(
    createRoute({
      tags: ["Users"],
      summary: "Search users",
      method: "get",
      path: "/search",
      request: {
        query: z.object({
          limit: z.coerce.number().nonnegative().default(50).openapi({
            example: 50,
            description: "Limit that the server will give",
          }),
          query: z.string().openapi({
            example: "Cecile",
            description: "Search Users",
          }),
        }),
      },
      responses: {
        200: {
          description: "Successful search",
        },
        400: {
          description: "Invalid search",
        },
        404: {
          description: "User not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const userId = c.get("userId");
        const hasPermission = await verifyPermission(userId, "USER", "read");
        
        if(!hasPermission) {
          throw new ForbiddenError("No permission to search users.");
        }

        const { limit, query } = c.req.valid("query");

        if (query.trim() === "") {
          throw new BadRequestError("Query string cannot be empty");
        }

        const users = await db.query.UsersTable.findMany({
          limit,
          where: or(
            like(UsersTable.email, `%${query}%`),
            like(UsersTable.firstName, `%${query}%`),
            like(UsersTable.lastName, `%${query}%`)
          ),
        });

        if (users.length === 0) {
          throw new NotFoundError("User not found");
        }

        return c.json({
          total: users.length,
          items: users,
        });
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )

userRoutes.openapi(
    createRoute({
      tags: ["Users"],
      summary: "Retrieve User by ID",
      method: "get",
      path: "/:id",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: GetUserDTO,
            },
          },
          description: "Retrieve the user",
        },
        400: {
          description: "Invalid user ID",
        },
        404: {
          description: "User not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const userId = c.get("userId");
        const hasPermission = await verifyPermission(userId, "USER", "read");
        
        if(!hasPermission){
          throw new ForbiddenError("No permission to get user.");
        }

        const paramId = Number(c.req.param("id"));

        if (isNaN(paramId)) {
          throw new BadRequestError("Invalid user ID");
        }

        const user = await db.query.UsersTable.findFirst({
          where: eq(UsersTable.userId, paramId),
        });

        if (!user) {
          throw new NotFoundError("User not found");
        }

        try {
          const validatedUser = GetUserDTO.parse(user);
          return c.json(validatedUser);
        } catch (error) {
          throw new BadRequestError("Invalid user data structure");
        }
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )
  
userRoutes.openapi(
    createRoute({
      tags: ["Users"],
      summary: "Update User by ID",
      method: "patch",
      path: "/:id",
      request: {
        body: {
          description: "Update User",
          required: true,
          content: {
            "application/json": { schema: UpdateUserDTO },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: GetUserDTO,
            },
          },
          description: "User Updated Successfully",
        },
        400: {
          description: "Invalid user ID",
        },
        404: {
          description: "User not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const userId = c.get("userId");
        const hasPermission = await verifyPermission(userId, "USER", "update");
        
        if(!hasPermission){
          throw new ForbiddenError("No permission to update user.");
        }

        const paramId = Number(c.req.param("id"));

        if (isNaN(paramId)) {
          throw new BadRequestError("Invalid user ID");
        }

        const user = await db.query.UsersTable.findFirst({
          where: eq(UsersTable.userId, paramId),
        });

        if (!user) {
          throw new NotFoundError("User not found");
        }

        const updatedUser = UpdateUserDTO.parse(await c.req.json());

        await db
          .update(UsersTable)
          .set(updatedUser)
          .where(eq(UsersTable.userId, paramId))
          .execute();

        return c.json(updatedUser);
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )

userRoutes.openapi(
    createRoute({
      tags: ["Users"],
      summary: "Delete User by ID",
      method: "delete",
      path: "/:id",
      responses: {
        200: {
          description: "User Deleted Successfully",
        },
        400: {
          description: "Invalid user ID",
        },
        404: {
          description: "User not found",
        },
      },
    }),
    async (c) => {
      try {
        const userId = c.get("userId");
        const hasPermission = await verifyPermission(userId, "USER", "delete");

        if(!hasPermission){
          throw new ForbiddenError("No permission to delete user.");
        }

        const paramId = Number(c.req.param("id"));

        if (isNaN(paramId)) {
          throw new BadRequestError("Invalid user ID");
        }

        const deletedUser = await db.query.UsersTable.findFirst({
          where: eq(UsersTable.userId, paramId),
        });

        if (!deletedUser) {
          throw new NotFoundError("User not found");
        }

        await db
          .delete(UsersTable)
          .where(eq(UsersTable.userId, paramId))
          .execute();

        return c.json({
          message: "User deleted successfully",
          user: deletedUser,
        });
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )

userRoutes.openapi(
    createRoute({
      tags: ["Users"],
      summary: "Retrieve all the user",
      method: "get",
      path: "/",
      request: {
        query: z.object({
          limit: z.coerce.number().nonnegative().openapi({
            example: 50,
            description: "Limit that the server will give",
          }),
          page: z.coerce.number().nonnegative().openapi({
            example: 0,
            description: "Page to get",
          }),
        }),
      },
      responses: {
        200: {
          description: "Retrieve all the user",
        },
        400: {
          description: "Invalid page or limit",
        },
        404: {
          description: "User not found",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const userId = c.get("userId");
        const hasPermission = await verifyPermission(userId, "USER", "read");

        if (!hasPermission) {
          throw new ForbiddenError("No permission to get users.");
        }

        const { limit, page } = c.req.valid("query");

        if (limit < 0 || page < 0) {
          throw new BadRequestError("Invalid page or limit");
        }

        const users = await db.query.UsersTable.findMany({
          limit,
          offset: (page - 1) * limit,
        });

        // if (users.length === 0) {
        //   throw new NotFoundError("User not found");
        // }

        const safeUsers = users.map((user) => GetUserDTO.parse(user));

        return c.json({
          total: safeUsers.length,
          items: safeUsers,
        });
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )

userRoutes.openapi(
    createRoute({
      tags: ["Users"],
      summary: "Create a new user",
      method: "post",
      path: "/",
      request: {
        body: {
          description: "User login credentials",
          required: true,
          content: {
            "application/json": { schema: CreateUserDTO },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: GetUserDTO,
            },
          },
          description: "User Created Sucessfully",
        },
        400: {
          description: "Invalid user data",
        },
        409: {
          description: "User already exists",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const userId = c.get("userId");
        const hasPermission = await verifyPermission(userId, "USER", "create");

        if (!hasPermission) {
          throw new ForbiddenError("No permission to create user.");
        }

        const body = c.req.valid("json");

        const existingUser = await db.query.UsersTable.findFirst({
          where: eq(UsersTable.email, body.email),
        });

        if (existingUser) {
          throw new ConflictError("User already exists");
        }

        const dbUser = (
          await db
            .insert(UsersTable)
            .values({
              ...body,
              password: await Bun.password.hash(body.password),
            })
            .returning()
            .execute()
        )[0];

        const { password, ...userWithoutPassword } = dbUser;

        return c.json(userWithoutPassword);
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )

userRoutes.openapi(
    createRoute({
      tags: ["Users"],
      summary: "Disable a user by ID",
      method : "patch",
      path : "/disable/:id",
      responses : {
        200 : {
          description: "User disabled successfully",
        },
        400 : {
          description: "Invalid user ID",
        },
        404 : {
          description: "User not found",
        },
        500 : {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      try {
        const userId = c.get("userId");
        const hasPermission = await verifyPermission(userId, "USER", "update");

        if (!hasPermission) {
          throw new ForbiddenError("No permission to disable user.");
        }

        const paramId = Number(c.req.param("id"));
        if (isNaN(paramId)) {
          throw new BadRequestError("Invalid user ID");
        }
        const user = await db.query.UsersTable.findFirst({  
          where: eq(UsersTable.userId, paramId),
        });

        if (!user) {
          throw new NotFoundError("User not found");
        }
        await db
          .update(UsersTable)
          .set({ status: "disable" })
          .where(eq(UsersTable.userId, paramId))
          .execute();

          return c.json({message: "User disabled successfully", paramId});

      } catch(err) {
        return  errorHandler(err, c);
      }
    }
  );

export default userRoutes;