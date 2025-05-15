import { z } from "@hono/zod-openapi";

export const RefundPaymentDTO = z.object({
  refundPaymentId: z.number().optional().openapi({
    description: "Unique identifier for the refund payment",
    example: 1,
  }),
  refundId: z.number().openapi({
    description: "Unique identifier for the refund",
    example: 1,
  }),
  paymentId: z.number().openapi({
    description: "Unique identifier for the payment",
    example: 1,
  }),
  amountRefunded: z.number().openapi({
    description: "Total amount refunded",
    example: 1000.0,
  }),
  createdAt: z.string().openapi({
    description: "Timestamp when the refund payment was made",
    example: new Date().toISOString(),
  }),
});
