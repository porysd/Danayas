import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AuthContext } from "../types";
import { authMiddleware } from "../middlewares/authMiddleware";
import { AuditLogDTO } from "../dto/auditLogDTO";
import { verifyPermission } from "../utils/permissionUtils";
import { BadRequestError, ForbiddenError } from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import db from "../config/database";
import { de } from "@faker-js/faker";
import { AuditLogsTable } from "../schemas/AuditLog";
import { eq } from "drizzle-orm";

const auditLogRoutes = new OpenAPIHono<AuthContext>();
auditLogRoutes.use("/*", authMiddleware);

auditLogRoutes.openapi(
  createRoute({
    tags: ["Audit Logs"],
    summary: "Get all audit logs",
    method: "get",
    path: "/",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      query: z.object({
        limit: z.coerce.number().nonnegative().min(1).default(20).openapi({
          example: 50,
          description: "Limit that the server will give",
        }),
        page: z.coerce.number().nonnegative().min(1).default(1).openapi({
          example: 1,
          description: "Page to get",
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: AuditLogDTO.array(),
          },
        },
        description: "Retrieve all audit logs",
      },
      400: {
        description: "Invalid request",
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
        "AUDIT_LOGS",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get audit logs.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        return c.json({ error: "Limit and page must be greater than 0" }, 400);
      }

      const auditLogs = await db.query.AuditLogsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allAuditLogs = auditLogs.map((auditLog) => {
        try {
          return AuditLogDTO.parse(auditLog);
        } catch (err) {
          throw new BadRequestError("Invalid audit log data");
        }
      });

      return c.json({
        total: auditLogs.length,
        items: allAuditLogs,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

auditLogRoutes.openapi(
  createRoute({
    tags: ["Audit Logs"],
    summary: "Get audit log by ID",
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
        id: z.coerce.number().int().openapi({ description: "Audit log ID" }),
      }),
    },
    responses: {
      200: {
        description: "Retrieve audit log by ID",
        content: {
          "application/json": {
            schema: AuditLogDTO,
          },
        },
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Audit log not found",
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
        "AUDIT_LOGS",
        "read"
      );
      if (!hasPermission) {
        throw new ForbiddenError("No permission to get audit logs.");
      }
      const { id } = c.req.valid("param");

      const auditLog = await db.query.AuditLogsTable.findFirst({
        where: eq(AuditLogsTable.auditLogId, id),
      });

      if (!auditLog) {
        return c.json({ error: "Audit log not found" }, 404);
      }
      return c.json(AuditLogDTO.parse(auditLog));
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default auditLogRoutes;
