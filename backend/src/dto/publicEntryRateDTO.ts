import { z } from "@hono/zod-openapi";

export const PublicEntryRateDTO = z.object({
  rateId: z.number().int().openapi({
    description: "Rate id",
    example: 1,
  }),
  rate: z.number().openapi({
    description: "Rate per head (either adult or kid rate)",
    example: 150,
  }),
  category: z.enum(["adult", "kid"]).openapi({
    description: "Category for the rate: 'adult' or 'kid'",
    example: "adult",
  }),
  mode: z.enum(["day-time", "night-time"]).openapi({
    description: "Mode for the rate, e.g. day-time or night-time",
    example: "day-time",
  }),
  isActive: z.boolean().openapi({
    description: "Flag indicating if this rate is active",
    example: true,
  }),
  createdAt: z.string().openapi({
    description: "The date and time when the rate was created",
    example: "2025-03-19T12:00:00Z",
  }),
});

export const CreatePublicEntryRateDTO = PublicEntryRateDTO.omit({
  rateId: true,
  createdAt: true,
});

export const UpdatePublicEntryRateDTO = PublicEntryRateDTO.omit({
  rateId: true,
  createdAt: true,
}).partial();
