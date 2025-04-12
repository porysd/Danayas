import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import db from "../config/database";
import { RegisterDTO, LoginDTO } from "../dto/authDTO";
import { UsersTable } from "../schemas/User";
import { eq } from "drizzle-orm";
import { sign, verify } from 'hono/jwt'
import { AccessTokenDTO } from "../dto/authDTO";
import { ErrorSchema } from "../utils/ErrorSchema";
import { UnauthorizedError, ConflictError } from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";

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
        409: {
          description: "User already exists",
          content:{
            "application/json": { schema: ErrorSchema}
          }
        }
      },
    }),
    async (c) => {
      try{
        const body = c.req.valid("json");

        const existingUser = await db.query.UsersTable.findFirst({
          where: eq(UsersTable.email, body.email),
        }).execute();
  
        if(existingUser) {
          throw new ConflictError("User already exists");
        }
  
        await db
          .insert(UsersTable)
          .values({
            ...body,
            password: await Bun.password.hash(body.password),
          })
          .execute();
  
        return c.redirect("/auth/login", 302);
      } catch(err){
        return errorHandler(err, c);
      }
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
        401: {
          description: "Invalid credentials",
          content: {
            "application/json": { schema: ErrorSchema },
          }
        }
      },
    }),
    async (c) => {
      try{
        const body = c.req.valid("json");
        const dbUser = await db.query.UsersTable.findFirst({
          where: eq(UsersTable.email, body.email)
        }).execute();
  
        if (!dbUser) {
          throw new UnauthorizedError("Invalid email or password");
        }
        if(!await Bun.password.verify(body.password, dbUser.password)) {
          throw new UnauthorizedError("Invalid email or password");
        }
  
        const payload = {
          sub: dbUser.userId,
          role: dbUser.role,
          iss: Bun.env.JWT_ISSUER || "",
          aud: Bun.env.JWT_AUDIENCE || "",
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
          nbf: Math.floor(Date.now() / 1000) - 3,
          iat: Math.floor(Date.now() / 1000),
          jti: crypto.randomUUID(),
        };
  
        const accessToken = await sign(
          payload,
          Bun.env.JWT_ACCESS_SECRET!,
        );
  
        const refreshToken = await sign(
          { ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) },
          Bun.env.JWT_REFRESH_SECRET!,
        );
        
        return c.json({
          accessToken,
          refreshToken,
          tokenType: "Bearer",
          exp: 3600,
        }, 200);
      } catch(err){
        return errorHandler(err, c);
      }
    },
  )
  .openapi(
    createRoute({
      tags: ["Authentication"],
      method: "post",
      path: "/refresh",
      request: {
        body: {
          description: "Refresh Access Token",
          required: true,
          content: {
            "application/json": {
              schema: AccessTokenDTO.pick({ refreshToken: true }),
            },
          },
        },
      },
      responses: {
        201: {
          description: "New Access Token",
          content: {
            "application/json": { schema: AccessTokenDTO },
          },
        },
        400: {
          description: "Invalid Refresh Token",
          content: {
            "application/json": { schema: ErrorSchema },
          },
        },
      },
    }),
    async (c) => {
      try {
        const body = c.req.valid("json");

        const token = await verify(
          body.refreshToken,
          Bun.env.JWT_REFRESH_SECRET!,
        );

        const payload = {
          sub: token.sub,
          role: token.role,
          iss: Bun.env.JWT_ISSUER || "",
          aud: Bun.env.JWT_AUDIENCE || "",
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
          nbf: Math.floor(Date.now() / 1000) - 3,
          iat: Math.floor(Date.now() / 1000),
          jti: crypto.randomUUID(),
        };

        const accessToken = await sign(
          payload,
          Bun.env.JWT_ACCESS_SECRET!,
        );

        const refreshToken = await sign(
          { ...payload, jti: crypto.randomUUID(), exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) },
          Bun.env.JWT_REFRESH_SECRET!,
        );

        return c.json({
          accessToken,
          refreshToken,
          tokenType: "Bearer",
          exp: 3600,
        }, 201);
      } catch (err) {
        return errorHandler(err, c);
      }
    },
  )
  .post("/logout", async (c) => {
    return c.text("Logout");
  });