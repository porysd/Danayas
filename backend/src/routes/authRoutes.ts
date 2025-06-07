import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import db from "../config/database";
import { RegisterDTO, LoginDTO } from "../dto/authDTO";
import { UsersTable } from "../schemas/User";
import { and, eq, gt } from "drizzle-orm";
import { sign, verify } from "hono/jwt";
import { AccessTokenDTO } from "../dto/authDTO";
import { ErrorSchema } from "../utils/ErrorSchema";
import { UnauthorizedError, ConflictError } from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import type { AuthContext } from "../types";
import { AuditLogsTable } from "../schemas/AuditLog";
import { GetUserDTO } from "../dto/userDTO";
import { VerificationTable } from "../schemas/schema";
import { randomUUID } from "crypto";
import { Resend } from "resend";

export default new OpenAPIHono<AuthContext>()
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
          content: {
            "application/json": { schema: ErrorSchema },
          },
        },
      },
    }),
    async (c) => {
      try {
        const body = c.req.valid("json");

        const existingUser = await db.query.UsersTable.findFirst({
          where: eq(UsersTable.email, body.email),
        }).execute();

        if (existingUser) {
          throw new ConflictError("User already exists");
        }

        const created = await db.transaction(async (tx) => {
          const createUser = (
            await tx
              .insert(UsersTable)
              .values({
                ...body,
                password: await Bun.password.hash(body.password),
              })
              .returning()
              .execute()
          )[0];

          const token = randomUUID();
          const tokenHashed = await Bun.password.hash(token);

          await tx.insert(VerificationTable).values({
            userId: createUser.userId,
            tokenHashed,
            tokenType: "email_verification",
            isUsed: 0,
            createdAt: new Date(Date.now()).toISOString(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 mins
          });

          const resend = new Resend(process.env.RESEND_API_KEY);
          const notifyResult = await resend.emails.send({
            from: "Email Verification <onboarding@resend.dev>",
            to: ["realrickyjones@gmail.com"],
            subject: `Email Verification from ${body.username}`,
            replyTo: body.email,
            html: `
              <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                  <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                    <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
                    <p style="margin: 5px 0 0; color: #fdfaf6;">Email Verification</p>
                  </div>
                  <div style="padding: 30px;">
                    <p style="font-size: 16px;">Hello,</p>
                    <p style="font-size: 15px;">Thank you for signing up. Please verify your email by clicking the link below:</p>

                    <div style="margin: 30px 0; text-align: center;">
                      <a href="http://localhost:3000/auth/verify-email?token=${token}" 
                        style="display: inline-block; background-color: #1e3d25; color: #fdfaf6; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Verify Email
                      </a>
                    </div>

                    <p style="font-size: 14px;">If the button above doesn’t work, you can also copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; font-size: 13px; color: #006400;">
                      http://localhost:3000/auth/verify-email?token=${token}
                    </p>

                    <p style="margin-top: 30px; font-size: 13px; color: #999;">
                      Sent automatically by the website on ${new Date().toLocaleString()}.
                    </p>
                  </div>
                  <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
                    <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
                  </div>
                </div>
              </div>
            `,
          });

          if (notifyResult.error) {
            return c.json(
              { success: false, error: notifyResult.error.message },
              500
            );
          }

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: createUser.userId,
              action: "create",
              tableName: "USER",
              recordId: createUser.userId,
              data: JSON.stringify(GetUserDTO.parse(createUser)),
              remarks: "User registration",
              createdAt: new Date().toISOString(),
            })
            .execute();

          return createUser;
        });
        // Should be redirect to the frontend for email verification
        return c.json(
          {
            message: "User created successfully. Please verify your email.",
            // user: {
            //   userId: created.userId,
            //   email: created.email,
            //   role: created.role,
            // },
          },
          201
        );
      } catch (err) {
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
          },
        },
      },
    }),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const dbUser = await db.query.UsersTable.findFirst({
          where: eq(UsersTable.email, body.email),
        }).execute();

        if (!dbUser) {
          throw new UnauthorizedError("Invalid email or password");
        }
        if (dbUser.status === "disable") {
          throw new UnauthorizedError(
            "Your account has been disabled. Please contact support."
          );
        }
        if (!(await Bun.password.verify(body.password, dbUser.password))) {
          throw new UnauthorizedError("Invalid email or password");
        }

        await db
          .insert(AuditLogsTable)
          .values({
            userId: dbUser.userId,
            action: "login",
            tableName: "USER",
            recordId: dbUser.userId,
            data: JSON.stringify(GetUserDTO.parse(dbUser)),
            remarks: "User logged in",
            createdAt: new Date().toISOString(),
          })
          .execute();

        const payload = {
          sub: dbUser.userId,
          role: dbUser.role,
          iss: Bun.env.JWT_ISSUER || "",
          aud: Bun.env.JWT_AUDIENCE || "",
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
          nbf: Math.floor(Date.now() / 1000) - 3,
          iat: Math.floor(Date.now() / 1000),
          jti: crypto.randomUUID(),
        };

        const accessToken = await sign(payload, Bun.env.JWT_ACCESS_SECRET!);

        const refreshToken = await sign(
          { ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 },
          Bun.env.JWT_REFRESH_SECRET!
        );

        return c.json(
          {
            user: {
              userId: dbUser.userId,
              role: dbUser.role,
            },
            accessToken,
            refreshToken,
            tokenType: "Bearer",
            exp: 3600,
          },
          200
        );
      } catch (err) {
        return errorHandler(err, c);
      }
    }
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
          Bun.env.JWT_REFRESH_SECRET!
        );

        const payload = {
          sub: token.sub,
          role: token.role,
          iss: Bun.env.JWT_ISSUER || "",
          aud: Bun.env.JWT_AUDIENCE || "",
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
          nbf: Math.floor(Date.now() / 1000) - 3,
          iat: Math.floor(Date.now() / 1000),
          jti: crypto.randomUUID(),
        };

        const accessToken = await sign(payload, Bun.env.JWT_ACCESS_SECRET!);

        const refreshToken = await sign(
          {
            ...payload,
            jti: crypto.randomUUID(),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
          },
          Bun.env.JWT_REFRESH_SECRET!
        );

        return c.json(
          {
            accessToken,
            refreshToken,
            tokenType: "Bearer",
            exp: 3600,
          },
          201
        );
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )
  .openapi(
    createRoute({
      tags: ["Authentication"],
      summary: "Verify user's email address using token",
      method: "post",
      path: "/verify-email",
      request: {
        query: z.object({
          token: z.string().openapi({
            description: "Verification token sent to the user's email",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          }),
        }),
      },
      responses: {
        201: {
          description: "Email verified successfully",
        },
        400: {
          description: "Invalid or expired token",
        },
      },
    }),
    async (c) => {
      try {
        const { token } = c.req.valid("query");

        const allTokens = await db.query.VerificationTable.findMany({
          where: and(
            eq(VerificationTable.tokenType, "email_verification"),
            eq(VerificationTable.isUsed, 0),
            gt(VerificationTable.expiresAt, new Date().toISOString())
          ),
        });

        let isTokenFound = false;
        for (const t of allTokens) {
          const isValid = await Bun.password.verify(token, t.tokenHashed);
          if (isValid) {
            // Mark the token as used
            await db
              .update(VerificationTable)
              .set({ isUsed: 1 })
              .where(eq(VerificationTable.tokenHashed, t.tokenHashed))
              .execute();

            // Update user's isVerified status
            await db
              .update(UsersTable)
              .set({ isVerified: 1 })
              .where(eq(UsersTable.userId, t.userId))
              .execute();

            isTokenFound = true;
          }
        }
        if (!isTokenFound) {
          throw new UnauthorizedError("Invalid or expired token");
        }

        return c.json(
          {
            message: "Email verified successfully",
          },
          200
        );
      } catch (err) {
        return errorHandler(err, c);
      }
    }
  )

  .post("/logout", async (c) => {
    return c.text("Logout");
  });
