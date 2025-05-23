import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import {
  termsConditionDTO,
  CreateTermsAndCondtionDTO,
  UpdateTermsAndCondtionDTO,
} from "../dto/termsAndConditionDTO";
import { TermsAndConditionTable } from "../schemas/TermsAndCondition";
import type { AuthContext } from "../types";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import { errorHandler } from "../middlewares/errorHandler";
import { eq } from "drizzle-orm";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { AuditLogsTable } from "../schemas/schema";

const termsRoutes = new OpenAPIHono<AuthContext>();

termsRoutes.use("/*", authMiddleware);

termsRoutes.openapi(
  createRoute({
    tags: ["Terms"],
    summary: "Get all TermsAndCondition",
    method: "get",
    path: "/",
    request: {
      query: z.object({
        limit: z.coerce.number().nonnegative().openapi({
          example: 10,
          description: "Limit that the server will give",
        }),
        page: z.coerce.number().nonnegative().openapi({
          example: 1,
          description: "Page to get",
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: termsConditionDTO.array(),
          },
        },
        description: "Retrieve all terms and condition",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "No Terms and Conditions found",
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
        "TermsAndCondition",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError(
          "No permission to change terms and conditions."
        );
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const conditions = await db.query.TermsAndConditionTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allTerms = conditions.map((condition) => {
        try {
          return termsConditionDTO.parse(condition);
        } catch (err) {
          throw new BadRequestError("Invalid terms data.");
        }
      });

      return c.json({
        total: conditions.length,
        items: allTerms,
      });
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);

termsRoutes.openapi(
  createRoute({
    tags: ["Terms"],
    summary: "Create a new Terms and Condition",
    method: "post",
    path: "/",
    request: {
      body: {
        description: "Create a new terms and condition",
        required: true,
        content: {
          "application/json": {
            schema: CreateTermsAndCondtionDTO,
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: CreateTermsAndCondtionDTO,
          },
        },
        description: "Terms and Conditions created successfully",
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
      const hasPermission = await verifyPermission(userId, "Terms", "create");

      if (!hasPermission) {
        throw new ForbiddenError(
          "No permission to create Terms and Condition."
        );
      }

      const parsed = CreateTermsAndCondtionDTO.parse(await c.req.json());

      const created = await db.transaction(async (tx) => {
        const dbterms = (
          await tx
            .insert(TermsAndConditionTable)
            .values(parsed)
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "create",
            tableName: "TERMS_AND_CONDITION",
            recordId: dbterms.termsId,
            createdAt: new Date().toISOString(),
          })
          .execute();

        return dbterms;
      });

      return c.json(termsConditionDTO.parse(created), 201);
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);

termsRoutes.openapi(
  createRoute({
    tags: ["Terms"],
    summary: "Delete Terms and Condition",
    method: "delete",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce.number().openapi({
          description: "The ID of the Terms and Condition to delete",
        }),
      }),
    },
    responses: {
      200: {
        description: "Terms and Condition deleted successfully",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Terms and Condition not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),

  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "Terms", "delete");

      if (!hasPermission) {
        throw new ForbiddenError(
          "No permission to delete Terms and Condition."
        );
      }

      const { id } = c.req.valid("param");

      const deleteTerms = await db.query.TermsAndConditionTable.findFirst({
        where: eq(TermsAndConditionTable.termsId, id),
      });

      if (!deleteTerms) {
        throw new NotFoundError("Terms and Condition not found.");
      }

      await db.transaction(async (tx) => {
        const deleteTermsAndCondition = (
          await tx
            .delete(TermsAndConditionTable)
            .where(eq(TermsAndConditionTable.termsId, id))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "delete",
            tableName: "TERMS_AND_CONDITION",
            recordId: deleteTermsAndCondition.termsId,
            createdAt: new Date().toISOString(),
          })
          .execute();
      });

      return c.json({
        status: "success",
        message: "Terms and Condition  deleted successfully",
      });
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);
termsRoutes.openapi(
  createRoute({
    tags: ["Terms"],
    summary: "Update Terms and Condition",
    method: "patch",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce.number().openapi({
          description: "The ID of the terms and conditions to update",
        }),
      }),
      body: {
        description: "Update Terms and Condition",
        required: true,
        content: {
          "application/json": {
            schema: UpdateTermsAndCondtionDTO,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Terms and Condition updated successfully",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Terms and Condition not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "Terns", "update");

      if (!hasPermission) {
        throw new ForbiddenError(
          "No permission to update terms and conditions."
        );
      }

      const { id } = c.req.valid("param");

      const existing = await db.query.TermsAndConditionTable.findFirst({
        where: eq(TermsAndConditionTable.termsId, id),
      });

      if (!existing) {
        throw new NotFoundError("Catalog Add-On not found.");
      }

      const updates = UpdateTermsAndCondtionDTO.parse(await c.req.json());

      const updated = await db.transaction(async (tx) => {
        const updatedTerms = (
          await db
            .update(TermsAndConditionTable)
            .set(updates)
            .where(eq(TermsAndConditionTable.termsId, id))
            .returning()
            .execute()
        )[0];

        if (!updatedTerms) {
          throw new NotFoundError("Terms and Condition not found.");
        }

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "update",
            tableName: "TERMS_AND_CONDITION",
            recordId: updatedTerms.termsId,
            createdAt: new Date().toISOString(),
          })
          .execute();

        return updatedTerms;
      });

      return c.json(termsConditionDTO.parse(updated), 201);
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);

export default termsRoutes;
