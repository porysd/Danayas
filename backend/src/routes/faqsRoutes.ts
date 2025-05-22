import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { FaqsDTO, CreateFaqsDTO, UpdateFaqsDTO } from "../dto/FaqsDTO";
import { FaqsTable } from "../schemas/FaqsTable";
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

const faqsRoutes = new OpenAPIHono<AuthContext>();

faqsRoutes.use("/*", authMiddleware);

faqsRoutes.openapi(
  createRoute({
    tags: ["Faqs"],
    summary: "Get all FAQs",
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
            schema: FaqsDTO.array(),
          },
        },
        description: "Retrieve all questions and answers",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "No FAQs found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "FAQs", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get bookings.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const faqs = await db.query.FaqsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allFaqs = faqs.map((faq) => {
        try {
          return FaqsDTO.parse(faq);
        } catch (err) {
          throw new BadRequestError("Invalid FAQ data.");
        }
      });

      return c.json({
        total: faqs.length,
        items: allFaqs,
      });
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);

faqsRoutes.openapi(
  createRoute({
    tags: ["Faqs"],
    summary: "Get an FAQ by ID",
    method: "get",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce
          .number()
          .openapi({ description: "The ID of the FAQ to retrieve" }),
      }),
    },
    responses: {
      200: {
        description: "Retrieve a specific FAQ",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "FAQ not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),

  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "FAQs", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get bookings.");
      }

      const { id } = c.req.valid("param");

      const faq = await db.query.FaqsTable.findFirst({
        where: eq(FaqsTable.faqsId, id),
      });

      if (!faq) {
        throw new NotFoundError("FAQ not found.");
      }

      return c.json(faq);
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);

faqsRoutes.openapi(
  createRoute({
    tags: ["Faqs"],
    summary: "Create a new FAQ",
    method: "post",
    path: "/",
    request: {
      body: {
        description: "Create a new FAQ",
        required: true,
        content: {
          "application/json": {
            schema: CreateFaqsDTO,
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: CreateFaqsDTO,
          },
        },
        description: "FAQ created successfully",
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
      const hasPermission = await verifyPermission(userId, "FAQs", "create");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create FAQs.");
      }

      const parsed = CreateFaqsDTO.parse(await c.req.json());

      const created = await db.transaction(async (tx) => {
        const dbFaq = (
          await tx.insert(FaqsTable).values(parsed).returning().execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "create",
            tableName: "FAQS",
            recordId: dbFaq.faqsId,
            createdAt: new Date().toISOString(),
          })
          .execute();

        return dbFaq;
      });

      return c.json(FaqsDTO.parse(created), 201);
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);

faqsRoutes.openapi(
  createRoute({
    tags: ["Faqs"],
    summary: "Update an FAQ",
    method: "patch",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce
          .number()
          .openapi({ description: "The ID of the FAQ to update" }),
      }),
      body: {
        description: "Update an FAQ",
        required: true,
        content: {
          "application/json": {
            schema: UpdateFaqsDTO,
          },
        },
      },
    },
    responses: {
      200: {
        description: "FAQ updated successfully",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "FAQ not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "FAQs", "update");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update FAQs.");
      }

      const { id } = c.req.valid("param");

      const existing = await db.query.FaqsTable.findFirst({
        where: eq(FaqsTable.faqsId, id),
      });

      if (!existing) {
        throw new NotFoundError("Catalog Add-On not found.");
      }

      const updates = UpdateFaqsDTO.parse(await c.req.json());

      const updated = await db.transaction(async (tx) => {
        const updatedFaq = (
          await tx
            .update(FaqsTable)
            .set(updates)
            .where(eq(FaqsTable.faqsId, id))
            .returning()
            .execute()
        )[0];

        if (!updatedFaq) {
          throw new NotFoundError("FAQ not found.");
        }

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "update",
            tableName: "FAQS",
            recordId: updatedFaq.faqsId,
            createdAt: new Date().toISOString(),
          })
          .execute();

        return;
      });

      return c.json(FaqsDTO.parse(updated), 201);
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);

faqsRoutes.openapi(
  createRoute({
    tags: ["Faqs"],
    summary: "Delete an FAQ",
    method: "delete",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce
          .number()
          .openapi({ description: "The ID of the FAQ to delete" }),
      }),
    },
    responses: {
      200: {
        description: "FAQ deleted successfully",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "FAQ not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),

  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "FAQs", "delete");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to delete FAQs.");
      }

      const { id } = c.req.valid("param");

      const deleteFaq = await db.query.FaqsTable.findFirst({
        where: eq(FaqsTable.faqsId, id),
      });

      if (!deleteFaq) {
        throw new NotFoundError("FAQ not found.");
      }

      const deleted = await db.transaction(async (tx) => {
        const deleteFaqs = (
          await tx
            .delete(FaqsTable)
            .where(eq(FaqsTable.faqsId, id))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "delete",
            tableName: "FAQS",
            recordId: deleteFaqs.faqsId,
            createdAt: new Date().toISOString(),
          })
          .execute();

        return deleteFaqs;
      });

      return c.json({
        status: "success",
        message: "FAQs deleted successfully",
      });
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);

export default faqsRoutes;
