import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { RefundPaymentsTable } from "../schemas/RefundPayment";
import { eq } from "drizzle-orm";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";
import { RefundPaymentDTO } from "../dto/refundPaymentDTO";

const refundPaymentRoutes = new OpenAPIHono<AuthContext>();

refundPaymentRoutes.use("/*", authMiddleware);

refundPaymentRoutes.openapi(
  createRoute({
    tags: ["Refund Payments"],
    summary: "Get all refund payments",
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
            schema: z.object({
              total: z.number(),
              items: RefundPaymentDTO.array(),
            }),
          },
        },
        description: "Retrieve all refund payments",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Refund payments not found",
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
        "REFUND_PAYMENTS",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get refund payments.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const refundPayments = await db.query.RefundPaymentsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allRefundPayments = refundPayments.map((refundPayment) => {
        try {
          return RefundPaymentDTO.parse(refundPayment);
        } catch (err) {
          throw new BadRequestError("Invalid Refund Payment data.");
        }
      });

      return c.json({
        total: refundPayments.length,
        items: allRefundPayments,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

//TODO: Implement routes for searching refund payments by ID, payment ID, and refund ID

export default refundPaymentRoutes;
