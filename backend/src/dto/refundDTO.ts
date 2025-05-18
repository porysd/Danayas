import { z } from "@hono/zod-openapi";

export const RefundDTO = z.object({
  refundId: z.number().optional().openapi({
    description: "Unique identifier for the refund",
    example: 1,
  }),
  bookingId: z.number().openapi({
    description: "Unique identifier for the booking",
    example: 1,
  }),
  verifiedBy: z.number().nullable().optional().openapi({
    description: "User ID of the staff who verified the refund",
    example: 1,
  }),
  refundMethod: z.enum(["gcash", "cash"]).nullable().optional().openapi({
    description: "Mode of refund",
    example: "gcash",
  }),
  refundAmount: z.number().openapi({
    description: "Total amount to be refunded",
    example: 1000.0,
  }),
  refundStatus: z.enum(["pending", "completed", "failed"]).openapi({
    description: "Status of the refund",
    example: "pending",
    default: "pending",
  }),
  refundReason: z.string().openapi({
    description: "Reason for the refund",
    example: "Booking cancelled",
  }),
  senderName: z.string().nullable().optional().openapi({
    description: "Name of the sender for the refund",
    example: "John Doe",
  }),
  reference: z.string().nullable().optional().openapi({
    description: "Reference number for the refund",
    example: "1654 156 156354",
  }),
  imageUrl: z.string().nullable().optional().openapi({
    description: "URL of the proof of refund image",
    example: "https://example.com/uploads/refund-proof.jpg",
  }),
  remarks: z.string().nullable().optional().openapi({
    description: "Remarks or notes about the refund",
    example: "Refund received successfully",
  }),
  createdAt: z.string().openapi({
    description: "Timestamp when the refund was made",
    example: new Date().toISOString(),
  }),
});
export const CreateRefundDTO = RefundDTO.pick({
    bookingId: true,
    verifiedBy: true,
    refundMethod: true,
    refundReason: true,
    senderName: true,
    reference: true,
    imageUrl: true,
    remarks: true,
});

// Sender name should not be nullable on update
export const UpdateRefundDTO = RefundDTO.pick({
    verifiedBy: true,
    refundMethod: true,
    refundStatus: true,
    refundReason: true,
    senderName: true,
    reference: true,
    imageUrl: true,
    remarks: true,
}).partial();
