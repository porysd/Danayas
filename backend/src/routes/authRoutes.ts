import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import db from "../config/database";
import { RegisterDTO, LoginDTO } from "../dto/authDTO";
import { usersTable } from "../schemas/User";
import { eq } from "drizzle-orm";

export default new OpenAPIHono()
  .openapi(
    createRoute({
      tags: ["Authentication"],
      method: "post",
      path: "/register",
      request: {
        body: {
          description: "Create user payload",
          required: true,
          content: {
            "application/json": { schema: RegisterDTO },
          },
        },
      },
      responses: {
        302: {
          description: "Retrieve the user",
        },
      },
    }),
    async (c) => {
      const body = c.req.valid("json");
      await db
        .insert(usersTable)
        .values({
          ...body,
          password: await Bun.password.hash(body.password),
        })
        .execute();

      return c.redirect("/auth/login", 302);
    }
  )
  .openapi(
    createRoute({
      tags: ["Authentication"],
      method: "post",
      path: "/login",
      request: {
        body: {
          description: "Login user",
          required: true,
          content: {
            "application/json": { schema: LoginDTO },
          },
        },
      },
      responses: {
        200: {
          description: "Retrieve the user",
        },
      },
    }),
    async (c) => {
      const body = c.req.valid("json");
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, body.email)
      }).execute();

      if (!user) {
        return c.json({
          message: "Invalid email or password",
          status: 400
        });
      }

      
      return c.text("Login");
    }
  )
  .post("refresh-token", async (c) => {
    return c.text("Refresh token");
  })
  .post("/logout", async (c) => {
    return c.text("Logout");
  });
