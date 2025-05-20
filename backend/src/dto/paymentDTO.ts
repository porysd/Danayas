import { z } from "@hono/zod-openapi";

export const PaymentDTO = z.object({
  paymentId: z.number().optional().openapi({
    description: "Unique identifier for the payment",
    example: 1,
  }),
  bookingId: z.number().nullable().optional().openapi({
    description: "Unique identifier for the booking",
    example: 1,
  }),
  publicEntryId: z.number().nullable().optional().openapi({
    description: "Public Entry ID ",
    example: 1,
  }),
  verifiedBy: z.number().nullable().optional().openapi({
    description: "User ID of the staff who verified the payment",
    example: 1,
  }),
  paymentMethod: z.enum(["gcash", "cash"]).openapi({
    description: "Mode of payment",
    example: "gcash",
  }),
  tenderedAmount: z.number().openapi({
    description: "Total amount tendered by the user",
    example: 1000.0,
  }),
  changeAmount: z.number().openapi({
    description: "Change amount to be returned to the user",
    example: 200.0,
    default: 0.0,
  }),
  netPaidAmount: z.number().openapi({
    description: "Net amount paid by the user",
    example: 1000.0,
  }),
  senderName: z.string().openapi({
    description: "Name of the sender for the payment",
    example: "John Doe",
  }),
  reference: z.string().nullable().optional().openapi({
    description: "Reference number for the payment",
    example: "1654 156 156354",
  }),
  imageUrl: z.string().nullable().optional().openapi({
    description: "URL of the proof of payment image",
    example: "https://example.com/uploads/payment-proof.jpg",
  }),
  paymentStatus: z.enum(["pending", "valid", "invalid", "voided"]).openapi({
    description: "Status of the payment",
    example: "pending",
    default: "pending",
  }),
  remarks: z.string().nullable().optional().openapi({
    description: "Remarks or notes about the payment",
    example: "Payment received successfully",
  }),
  createdAt: z.string().openapi({
    description: "Timestamp when the payment was made",
    example: new Date().toISOString(),
  }),
});
export const CreatePaymentDTO = PaymentDTO.pick({
  bookingId: true,
  publicEntryId: true,
  paymentMethod: true,
  tenderedAmount: true,
  //paymentStatus: true, // TODO: relocate to partial() once admin auto validation is implemented
  senderName: true,
  reference: true,
  imageUrl: true,
})
  .partial()
  .refine(
    (data) => {
      const hasBookingId = typeof data.bookingId === "number";
      const hasPublicEntryId = typeof data.publicEntryId === "number";
      return (
        (hasBookingId && !hasPublicEntryId) ||
        (!hasBookingId && hasPublicEntryId)
      );
    },
    {
      message: "You must provide exactly one of bookingId or publicEntryId",
      path: ["bookingId", "publicEntryId"],
    }
  );

export const UpdatePaymentDTO = PaymentDTO.pick({
  bookingId: true,
  publicEntryId: true,
  verifiedBy: true,
  senderName: true,
  reference: true,
  imageUrl: true,
  paymentStatus: true,
  remarks: true,
}).partial();
