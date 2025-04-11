import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CreateUserDTO, UpdateUserDTO, GetUserDTO } from "../dto/userDTO";
import db from "../config/database";
import { UsersTable } from "../schemas/User";
import { eq, like, or } from "drizzle-orm";

export default new OpenAPIHono()

  // TODO: Verify if user id exists
  .openapi(
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
            example: "Cruz Package",
            description: "Search Users",
          }),
        }),
      },
      responses: {
        200: {
          description: "Successful search",
        },
      },
    }),
    async (c) => {
      const { limit, query } = c.req.valid("query");

      const users = await db.query.UsersTable.findMany({
        limit,
        where: or(
          like(UsersTable.email, `%${query}%`),
          like(UsersTable.firstName, `%${query}%`),
          like(UsersTable.lastName, `%${query}%`)
        ),
      });

      return c.json({
        total: users.length,
        items: users,
      });
    }
  )
  .openapi(
    createRoute({
      tags: ["Users"],
      method: "get",
      path: "/:id",
      summary: "Retrieve the user by ID",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: GetUserDTO,
            },
          },
          description: "Retrieve the user",
        },
      },
    }),
    async (c) => {
      // TODO: Add error if user id don't exist
      const user = GetUserDTO.parse(
        await db.query.UsersTable.findFirst({
          where: eq(UsersTable.userId, Number(c.req.param("id"))),
        })
      );
      return c.json(user);
    }
  )
  .openapi(
    createRoute({
      tags: ["Users"],
      method: "patch",
      path: "/:id",
      summary: "Update the user by ID",
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
          description: "User Updated",
        },
        400: {
          description: "Invalid user ID",
        },
      },
    }),
    async (c) => {
      const userId = Number(c.req.param("id"));

      await db
        .update(UsersTable)
        .set(UpdateUserDTO.parse(await c.req.json()))
        .where(eq(UsersTable.userId, userId))
        .execute();
      return c.text("User Updated");
    }
  )
  .openapi(
    createRoute({
      tags: ["Users"],
      method: "delete",
      path: "/:id",
      summary: "Delete the user by ID",
      responses: {
        200: {
          description: "User Deleted",
        },
        400: {
          description: "Invalid user ID",
        },
      },
    }),
    async (c) => {
      const userId = Number(c.req.param("id"));

      await db
        .delete(UsersTable)
        .where(eq(UsersTable.userId, userId))
        .execute();
      return c.text("User Deleted!");
    }
  )
  //TODO: add page and limit
  .openapi(
    createRoute({
      tags: ["Users"],
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
      summary: "Retrieve all the user",
      responses: {
        200: {
          // content: {
          //   "application/json": {
          //     schema: GetUserDTO.array(),
          //   },
          // },
          description: "Retrieve all the user",
        },
      },
    }),
    async (c) => {
      const { limit, page } = c.req.valid("query");

      const users = await db.query.UsersTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });
      const safeUsers = users.map((user) => GetUserDTO.parse(user));
      return c.json({
        total: safeUsers.length,
        items: safeUsers,
      });
    }
  )

  .openapi(
    createRoute({
      tags: ["Users"],
      method: "post",
      path: "/",
      summary: "Create a new user",
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
          description: "User Created",
        },
      },
    }),
    async (c) => {
      const body = c.req.valid("json");
      const dbUser = (
        await db
          .insert(UsersTable)
          .values({
            ...body,
            password: await Bun.password.hash(body.password),
          }).returning()
          .execute()
      )[0];

      const { password, ...userWithoutPassword } = dbUser;

      return c.json(userWithoutPassword);
    }
  );