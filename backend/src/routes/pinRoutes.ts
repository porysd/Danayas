import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { UsersTable } from "../schemas/User";
import { AuditLogsTable } from "../schemas/schema";
import type { AuthContext } from "../types";
import { authMiddleware } from "../middlewares/authMiddleware";
import { errorHandler } from "../middlewares/errorHandler";
import { grantPermission, verifyPermission } from "../utils/permissionUtils";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";
import { eq } from "drizzle-orm";

const pinRoutes = new OpenAPIHono<AuthContext>();

pinRoutes.use("/*", authMiddleware);

pinRoutes.openapi(
  createRoute({
    tags: ["PIN"],
    summary: "Set or reset a PIN for the admin",
    method: "post",
    path: "/set",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              //   userId: z.string().openapi({
              //     description: "ID of the user to set the PIN for",
              //     example: "user123",
              //   }),
              pin: z
                .string()
                .length(6)
                .regex(/^\d+$/, "PIN must be numeric")
                .openapi({
                  description: "New PIN to set for the user",
                  example: "123456",
                }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "PIN set successfully",
      },
      403: {
        description: "Not authorized",
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
      const adminId = c.get("userId");
      const { pin } = await c.req.json();

      const user = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userId, adminId),
      });

      if (!user) {
        throw new NotFoundError("User not found.");
      }

      if (user.role !== "admin") {
        throw new ForbiddenError("Only admins are allowed to set PIN");
      }

      const hasPermission = await verifyPermission(adminId, "USER", "update");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to set PINs.");
      }

      const targetUser = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userId, adminId),
      });

      if (!targetUser) {
        throw new NotFoundError("Target user not found.");
      }

      const hashedPin = await Bun.password.hash(pin);

      const updated = await db.transaction(async (tx) => {
        const updatedUser = (
          await tx
            .update(UsersTable)
            .set({ pin: hashedPin })
            .where(eq(UsersTable.userId, adminId))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: adminId,
            action: "update",
            tableName: "USER",
            recordId: updatedUser.userId,
            data: JSON.stringify({ pin: "[PROTECTED]" }),
            remarks: "PIN set/reset",
            createdAt: new Date().toISOString(),
          })
          .execute();

        return updatedUser;
      });

      return c.json({ message: "PIN set successfully." });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

pinRoutes.openapi(
  createRoute({
    tags: ["PIN"],
    summary: "Staff verifies admin PIN to gain update-payment access",
    method: "post",
    path: "/verify",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              pin: z
                .string()
                .length(6)
                .regex(/^\d+$/, "PIN must be numeric")
                .openapi({
                  description: "New PIN to set for the user",
                  example: "123456",
                }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "PIN verified successfully",
      },
      401: {
        description: "Invalid PIN",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const staffId = c.get("userId"); // staff making request
      const { pin } = await c.req.valid("json");

      // find admin who owns the matching pin
      const admins = await db.query.UsersTable.findMany({
        where: eq(UsersTable.role, "admin"),
      });

      let matchingAdmin = null;
      for (const admin of admins) {
        if (admin.pin && (await Bun.password.verify(pin, admin.pin))) {
          matchingAdmin = admin;
          break;
        }
      }
      if (!matchingAdmin) {
        throw new UnauthorizedError("Invalid PIN.");
      }

      // Grant permission to staff
      const granted = await grantPermission(
        staffId,
        "PAYMENT",
        "overrideAmount"
      );

      await db
        .insert(AuditLogsTable)
        .values({
          userId: staffId,
          action: "create",
          tableName: "PERMISSION",
          recordId: staffId,
          data: JSON.stringify({
            grantedBy: matchingAdmin.userId,
            table: "PAYMENTS",
            action: "update",
          }),
          remarks: `Staff verified admin PIN and was granted temporary payment update access`,
          createdAt: new Date().toISOString(),
        })
        .execute();
      // TODO: if one time pin, add update usersTable to set admin pin to null

      return c.json(
        {
          message: "PIN verified and permission granted",
          grantedBy: matchingAdmin.userId,
          success: granted,
        },
        200
      );
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default pinRoutes;
