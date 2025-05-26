import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  grantPermission,
  revokePermission,
  verifyPermission,
} from "../../utils/permissionUtils";
import { GrantPermissionDTO } from "../../dto/permisssionDTO";
import { errorHandler } from "../../middlewares/errorHandler";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { ForbiddenError } from "../../utils/errors";
import type { AuthContext } from "../../types";
import { verify } from "crypto";

const permissionRoutes = new OpenAPIHono<AuthContext>();

permissionRoutes.use("/*", authMiddleware);

permissionRoutes.openapi(
  createRoute({
    tags: ["Admin Permissions"],
    summary: "Grant a permission to a user",
    method: "post",
    path: "/grant",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          example: "Bearer <token>",
          description: "Admin access token",
        }),
      }),
      body: {
        content: {
          "application/json": {
            schema: GrantPermissionDTO,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Permission granted",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
      },
      403: {
        description: "Not authorized to grant permission",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const currentUserId = c.get("userId");

      const isAdmin = await verifyPermission(
        currentUserId,
        "permission_table",
        "create"
      );

      if (!isAdmin) {
        throw new ForbiddenError("Only admin can grant permissions.");
      }

      const { userId, table, action } = c.req.valid("json");
      const success = await grantPermission(userId, table, action);
      return c.json({ success });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

permissionRoutes.openapi(
  createRoute({
    tags: ["Admin Permissions"],
    summary: "Revoke a permission from a user",
    method: "post",
    path: "/revoke",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          example: "Bearer <token>",
          description: "Admin access token",
        }),
      }),
      body: {
        content: {
          "application/json": {
            schema: GrantPermissionDTO,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Permission revoked",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
      },
      403: {
        description: "Not authorized to revoke permission",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const currentUserId = c.get("userId");

      const isAdmin = await verifyPermission(
        currentUserId,
        "permission_table",
        "delete"
      );

      if (!isAdmin) {
        throw new ForbiddenError("Only admin can revoke permissions.");
      }

      const { userId, table, action } = c.req.valid("json");
      const success = await revokePermission(userId, table, action);
      return c.json({ success });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default permissionRoutes;
