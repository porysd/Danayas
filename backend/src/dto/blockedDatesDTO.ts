import { z } from "@hono/zod-openapi";

export const BlockedDatesDTO = z.object({
  blockedDatesId: z.number().int().openapi({
    description: "Blocked Dates id",
    example: 1,
  }),
  blockedDates: z.string().openapi({
    description: "Blocked Date",
    example: "03-25-25",
  }),
  category: z
    .enum([
      "maintenance",
      "holiday",
      "internal-use",
      "natural-disaster",
      "others",
    ])
    .openapi({
      description: "Category for the blocked dates",
      example: "maintenance",
    }),
  status: z.enum(["active", "cancelled"]).openapi({
    description: "Blocked date status",
    example: "active",
    default: "active",
  }),
  others: z.string().nullable().optional().openapi({
    description: "Other reason",
    example: "internal use",
  }),
  createdBy: z.number().int().openapi({
    description: "The ID of the user who made the blocked dates",
    example: 3,
  }),
  createdAt: z.string().openapi({
    description: "The date and time when the rate was created",
    example: "2025-03-19T12:00:00Z",
  }),
});

export const CreateBlockedDatesDTO = BlockedDatesDTO.omit({
  blockedDatesId: true,
  status: true,
  createdBy: true,
  createdAt: true,
});

export const UpdateBlockedDatesDTO = BlockedDatesDTO.omit({
  blockedDatesId: true,
  createdBy: true,
  createdAt: true,
}).partial();
