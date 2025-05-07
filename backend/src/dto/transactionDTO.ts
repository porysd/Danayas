import { z } from "@hono/zod-openapi";

export const TransactionDTO = z.object({
  transactionId: z.number().int().openapi({
    description: "The ID of the transaction",
    example: 1,
  }),
  bookingId: z.number().int().openapi({
    description: "The ID of the payment",
    example: 1,
  }),
  transactionStatus: z.enum(["partially-paid", "paid", "voided"]).openapi({
    description: "Status of the transaction",
    example: "paid",
  }),
  refundStatus: z.enum(["none", "pending", "refunded"]).openapi({
    description: "Status of the refund",
    example: "pending",
    default: "none",
  }),
  remainingBalance: z.number().openapi({
    description: "The remaining balance for the transaction",
    example: 1500.0,
  }),
  createdAt: z.string().openapi({
    description: "The date and time when the transaction was created",
    example: "2025-03-19T12:00:00Z",
  }),
});
export const CreateTransactionDTO = TransactionDTO.pick({
  bookingId: true,
});