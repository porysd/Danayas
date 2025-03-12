import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import db from "../config/database";
import { eq } from "drizzle-orm";
import { User } from "../schemas/User";
import { ErrorSchema } from "../utils/error";
import jwt from "jsonwebtoken";

/*
export const User = sqliteTable("USER", {
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  contactNo: text("contactNo").notNull(),
  address: text("address").notNull(),
  // changing to active and inactive enum
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
});
*/

// DATA TRANSFER OBJECT
export const CreateUserDTO = z.object({
  firstName: z.string().openapi({
    description: "First name of the user",
    example: "John",
  }),
  lastName: z.string().openapi({
    description: "Last name of the user",
    example: "doe",
  }),
  contactNo: z.string().openapi({
    description: "Contact number of the user",
    example: "+63920139423",
  }),
  address: z.string().openapi({
    description: "Address of the user",
    example: "2314 Potcholo House Street, Quezon City",
  }),
  // changing to active and inactive enum
  email: z.string().email().openapi({
    description: "Email of the user",
    example: "example@email.com",
  }),
  password: z.string().min(8),
});

export const LoginUserDTO = CreateUserDTO.pick({ email: true, password: true });

export const UserDTO = CreateUserDTO.omit({ password: true }).extend({
  role: z.enum(["admin", "staff", "customer"]).openapi({
    description: "Role of the user",
    example: "customer",
    default: "customer",
  }),
  userId: z.number(),
  dateReg: z.string().openapi({
    description: "The date where the user registered",
    example: new Date().toUTCString(),
  }),
});

// basic auth - Basic username:password // database access
// bearer auth - Bearer token // hindi
// oauth auth -
export const AccessTokenDTO = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string().default("Bearer"),
  exp: z.number().default(3600),
});

export default new OpenAPIHono()
  .openapi(
    createRoute({
      tags: ["Authentication"],
      method: "get",
      path: "/user/:id",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: UserDTO,
            },
          },
          description: "Retrieve the user",
        },
      },
    }),
    async (c) => {
      const user = UserDTO.parse(
        await db.query.User.findFirst({
          where: eq(User.userId, Number(c.req.param("id"))),
        }).execute(),
      );
      return c.json(user);
    },
  )
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
            "application/json": { schema: CreateUserDTO },
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
      const payload = c.req.valid("json");

      // TODO: SAVE THE DATA TO DB
      await db.insert(User).values({
        ...payload,
        password: await Bun.password.hash(payload.password),
      }).execute();

      return c.redirect("/auth/login", 302);
    },
  )
  .openapi(
    createRoute({
      tags: ["Authentication"],
      method: "post",
      path: "/login",
      request: {
        body: {
          description: "User login credentials",
          required: true,
          content: {
            "application/json": { schema: LoginUserDTO },
          },
        },
      },
      responses: {
        200: {
          description: "Retrieve the user",
          content: {
            "application/json": { schema: AccessTokenDTO },
          },
        },
        400: {
          description: "Invalid email or password",
          content: {
            "application/json": { schema: ErrorSchema },
          },
        },
      },
    }),
    async (c) => {
      // validate
      const payload = c.req.valid("json");

      // get the email first
      const dbUser = await db.query.User.findFirst({
        where: eq(User.email, payload.email),
      }).execute();

      if (!dbUser) {
        return c.json({
          code: 400,
          message: "Invalid Email or Password",
        }, 400);
      }

      if (!await Bun.password.verify(payload.password, dbUser.password)) {
        return c.json({
          code: 400,
          message: "Invalid Email or Password",
        }, 400);
      }

      const claims = {
        sub: dbUser.userId,
        iss: Bun.env.JWT_ISSUER || "",
        aud: Bun.env.JWT_AUDIENCE || "",
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        nbf: Math.floor(Date.now() / 1000) - 3,
        iat: Date.now(),
        jti: crypto.randomUUID(),
      };

      const accessToken = jwt.sign(
        claims,
        Bun.env.JWT_ACCESS_SECRET!,
      );

      const refreshToken = jwt.sign(
        { ...claims, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) },
        Bun.env.JWT_REFRESH_SECRET!,
      );

      return c.json({
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        exp: 3600,
      }, 200);
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
        const payload = c.req.valid("json");

        const token = jwt.verify(
          payload.refreshToken,
          Bun.env.JWT_REFRESH_SECRET!,
        );

        // additional validation

        const claims = {
          sub: token.sub,
          iss: Bun.env.JWT_ISSUER || "",
          aud: Bun.env.JWT_AUDIENCE || "",
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
          nbf: Math.floor(Date.now() / 1000) - 3,
          iat: Date.now(),
          jti: crypto.randomUUID(),
        };

        const accessToken = jwt.sign(
          claims,
          Bun.env.JWT_ACCESS_SECRET!,
        );

        const refreshToken = jwt.sign(
          { ...claims, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) },
          Bun.env.JWT_REFRESH_SECRET!,
        );

        return c.json({
          accessToken,
          refreshToken,
          tokenType: "Bearer",
          exp: 3600,
        }, 201);
      } catch (e) {
        return c.json({
          code: 400,
          message: "Invalid refresh token",
        }, 400);
      }
    },
  );
