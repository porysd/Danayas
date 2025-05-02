import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { TransactionsTable } from "../schemas/Transaction";
import { TransactionDTO, CreateTransactionDTO } from "../dto/transactionDTO";
import { eq } from "drizzle-orm";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import { PaymentsTable, BookingsTable, PackagesTable } from "../schemas/schema";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";

const transactionRoutes = new OpenAPIHono<AuthContext>();

transactionRoutes.use("/*", authMiddleware);

transactionRoutes.openapi(
  createRoute({
    tags: ["Transactions"],
    summary: "Get all transactions",
    method: "get",
    path: "/",
    request: {
      query: z.object({
        limit: z.coerce.number().nonnegative().openapi({
          example: 50,
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
            schema: TransactionDTO.array(),
          },
        },
        description: "Retrieve all transactions",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "Transactions not found",
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
        "TRANSACTION",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get transactions.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const transactions = await db.query.TransactionsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allTransactions = transactions.map((Transaction) => {
        try {
          return TransactionDTO.parse(Transaction);
        } catch (err) {
          throw new BadRequestError("Invalid Transaction data.");
        }
      });

      return c.json({
        total: transactions.length,
        items: allTransactions,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

transactionRoutes.openapi(
  createRoute({
    tags: ["Transactions"],
    summary: "Get Transaction by ID",
    method: "get",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce.number().int().openapi({ description: "Transaction ID" }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: TransactionDTO,
          },
        },
        description: "Transaction found",
      },
      404: {
        description: "Transaction not found",
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
        "TRANSACTION",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get transaction.");
      }

      const { id } = c.req.valid("param");
      const transaction = await db.query.TransactionsTable.findFirst({
        where: eq(TransactionsTable.transactionId, id),
      });

      if (!transaction) {
        throw new NotFoundError("Transaction not found.");
      }

      return c.json(TransactionDTO.parse(transaction));
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

transactionRoutes.openapi(
  createRoute({
    tags: ["Transactions"],
    summary: "Create Transaction",
    method: "post",
    path: "/",
    request: {
      body: {
        description: "Create Transaction",
        required: true,
        content: {
          "application/json": {
            schema: CreateTransactionDTO,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Transaction created",
        content: {
          "application/json": {
            schema: TransactionDTO,
          },
        },
      },
      400: {
        description: "Invalid Transaction data",
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
        "TRANSACTION",
        "create"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create transaction.");
      }

      const parsed = CreateTransactionDTO.parse(await c.req.json());
      // TODO: Add validation to check if the bookingId already exists in the transaction table

      const booking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, parsed.bookingId),
      });

      if (!booking) {
        throw new NotFoundError("Booking not found.");
      }

      // Check if the booking is installment or full payment
      let status: "paid" | "partially-paid" | "voided";

      if (booking.paymentTerms === "installment") {
        status = "partially-paid";
      } else {
        status = "paid";
      } 

      const created = (
        await db
          .insert(TransactionsTable)
          .values({
            bookingId: parsed.bookingId,
            transactionStatus: status,
            remainingBalance: booking.totalAmount,
          })
          .returning()
          .execute()
      )[0];

      return c.json(TransactionDTO.parse(created), 201);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default transactionRoutes;
