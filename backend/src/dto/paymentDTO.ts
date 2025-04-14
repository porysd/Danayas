import { z } from "@hono/zod-openapi";

export const PaymentDTO = z.object({
    paymentId: z.number().optional().openapi({
        description: "Unique identifier for the payment",
        example: 1,
    }),
    bookingId: z.number().openapi({
        description: "Identifier for the associated booking",
        example: 101,
    }),
    imageUrl: z.string().openapi({
        description: 'URL of the proof of payment image',
        example: 'https://example.com/uploads/payment-proof.jpg',
      }),
    discountAmount: z.number().nullable().optional().openapi({
        description: "Discount amount applied to the payment",
        example: 50.0,
    }),
    downpaymentAmount: z.number().openapi({
        description: "Downpayment amount for the booking",
        example: 500.0,
    }),
    amountPaid: z.number().openapi({
        description: "Amount paid by the user",
        example: 1000.0,
    }),
    totalAmountDue: z.number().openapi({
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
    paymentStatus: z.enum(["refund", "partially-paid", "paid", "failed"]).openapi({
        description: "Status of the payment",
        example: "paid",
        default: "partially-paid",
    }),
    paidAt: z.string().openapi({
        description: "Timestamp when the payment was made",
        example: new Date().toISOString(),
    }),
});
export const CreatePaymentDTO = PaymentDTO.omit({
    paymentId: true,
    paidAt: true
});
export const UpdatePaymentDTO = PaymentDTO.pick({
    paymentStatus: true
})