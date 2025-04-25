import { z } from "@hono/zod-openapi";

export const PaymentDTO = z.object({
  paymentId: z.number().optional().openapi({
    description: "Unique identifier for the payment",
    example: 1,
  }),
  transactionId: z.number().openapi({
    description: "Identifier for the associated transaction",
    example: 101,
  }),
  imageUrl: z.string().nullable().optional().openapi({
    description: "URL of the proof of payment image",
    example: "https://example.com/uploads/payment-proof.jpg",
  }),
  downPaymentAmount: z.number().nullable().optional().openapi({
    description: "Downpayment amount for the booking",
    example: 500.0,
  }),
  amountPaid: z.number().openapi({
    description: "Amount paid by the user",
    example: 1000.0,
  }),
  remainingBalance: z.number().openapi({
    description: "Total amount due for the booking",
    example: 1500.0,
  }),
  mode: z.enum(["gcash", "cash"]).openapi({
    description: "Mode of payment",
    example: "gcash",
  }),
  reference: z.string().nullable().optional().openapi({
    description: "Reference number for the payment",
    example: "1654 156 156354",
  }),
  senderName: z.string().openapi({
    description: "Name of the sender for the payment",
    example: "John Doe",
  }),
  refundAmount: z.number().nullable().optional().openapi({
    description: "Amount refunded to the user",
    example: 1000.0,
  }),
  paymentStatus: z.enum(["partially-paid", "paid", "voided"]).openapi({
    description: "Status of the payment",
    example: "paid",
    default: "partially-paid",
  }),
  refundStatus: z.enum(["none", "pending", "refunded", "cancelled"]).openapi({
    description: "Status of the refund",
    example: "refunded",
    default: "none",
  }),
  paidAt: z.string().openapi({
    description: "Timestamp when the payment was made",
    example: new Date().toISOString(),
  }),
});
export const CreatePaymentDTO = PaymentDTO.pick({
  transactionId: true,
  senderName: true,
  imageUrl: true,
  mode: true,
  reference: true,
});
export const RefundPaymentDTO = PaymentDTO.pick({
  transactionId: true,
  senderName: true,
  imageUrl: true,
  mode: true,
  reference: true,
});

export const UpdatePaymentDTO = PaymentDTO.pick({
  paymentStatus: true,
  // refundStatus: true,
});
