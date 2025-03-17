import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { RegisterDTO } from "../dto/authDTO";
import { UserDTO, UpdateUserDTO, GetUserDTO } from "../dto/userDTO";
import db from "../config/database";
import { usersTable } from "../schemas/User";
import { eq } from "drizzle-orm";

export default new OpenAPIHono()

  // TODO: Verify if user id exists
  .openapi(
    createRoute({
      tags: ["Users"],
      method: "get",
      path: "/user/:id",
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
        await db.query.usersTable.findFirst({
          where: eq(usersTable.userId, Number(c.req.param("id"))),
        })
      );
      return c.json(user);
    }
  )

  .openapi(
    createRoute({
      tags: ["Users"],
      method: "get",
      path: "/users",
      summary: "Retrieve all the user",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: GetUserDTO.array(),
            },
          },
          description: "Retrieve all the user",
        },
      },
    }),
    async (c) => {
      const users = await db.query.usersTable.findMany();
      const safeUsers = users.map((user) => GetUserDTO.parse(user));
      return c.json(safeUsers);
    }
  )

  .openapi(
    createRoute({
      tags: ["Users"],
      method: "post",
      path: "/user",
      summary: "Create a new user",
      request: {
        body: {
          description: "User login credentials",
          required: true,
          content: {
            "application/json": { schema: RegisterDTO },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: RegisterDTO,
            },
          },
          description: "User Created",
        },
        // TODO: Add error if wrong data input 400:
      },
    }),
    async (c) => {
      const body = RegisterDTO.parse(await c.req.json());
      await db.insert(usersTable).values(body).execute();
      return c.json(body);
    }
  )

  .openapi(
    createRoute({
      tags: ["Users"],
      method: "delete",
      path: "/user/:id",
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
        .delete(usersTable)
        .where(eq(usersTable.userId, userId))
        .execute();
      return c.text("User Deleted!");
    }
  )

  .openapi(
    createRoute({
      tags: ["Users"],
      method: "patch",
      path: "/user/:id",
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
        .update(usersTable)
        .set(UpdateUserDTO.parse(await c.req.json()))
        .where(eq(usersTable.userId, userId))
        .execute();
      return c.text("User Updated");
    }
  );

// TODO: Add search user by email