import { z } from "@hono/zod-openapi";

export const BillingDTO = z.object({
    billingId: z.number().int().openapi({
        description: "The ID of the billing",
        example: 1,
    }),
    bookingId: z.number().int().openapi({
        description: "The ID of the payment",
        example: 1,
    }),
    createdAt: z.string().openapi({
        description: "The date and time when the billing was created",
        example: "2025-03-19T12:00:00Z",
    }),
})
export const CreateBillingDTO = BillingDTO.pick({
    bookingId: true,
});