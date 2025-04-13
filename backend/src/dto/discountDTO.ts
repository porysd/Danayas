import { z } from "@hono/zod-openapi";

export const DiscountDTO = z.object({
  discountId: z.number().int().openapi({
    description: "The ID of the discount",
    example: 1,
  }),
  name: z.string().openapi({
    description: "Name of the discount",
    example: "Senior Citizen Discount",
  }),
  percentage: z.number().min(0).max(1).openapi({
    description: "Discount percentage applied in decimal form",
    example: 0.5,
  }),
  typeFor: z.string().openapi({
    description: "Type of discount (e.g. pwd, senior, student)",
    example: "senior",
  }),
  status: z.enum(["active", "inactive"]).openapi({
    description: "Status of the discount",
    example: "active",
  }),
  createdAt: z.string().openapi({
    description: "The date when the booking was created",
    example: new Date().toISOString(),
  }),
});

export const CreateDiscountDTO = DiscountDTO.omit({
  discountId: true,
  createdAt: true,
});

export const UpdateDiscountDTO = DiscountDTO.omit({
  discountId: true,
  createdAt: true,
}).partial();
