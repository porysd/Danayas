import { z } from "@hono/zod-openapi";

export const PublicEntryAddOnDTO = z.object({
  publicAddOnId: z.number().int().openapi({
    description: "The ID of the catalog add-on",
    example: 1,
  }),
  publicEntryId: z.number().int().openapi({
    description: "The ID of the public entry",
    example: 1,
  }),
  catalogAddOnId: z.number().int().openapi({
    description: "The ID of the catalog add-on",
    example: 1,
  }),
  price: z.number().openapi({
    description: "Price of the add on",
    example: 500,
  }),
  createdAt: z.string().openapi({
    description: "The date when the booking was created",
    example: new Date().toISOString(),
  }),
});

export const CreatePublicEntryAddOnDTO = PublicEntryAddOnDTO.omit({
  publicAddOnId: true,
  createdAt: true,
  price: true,
});

export const UpdatePublicEntryAddOnDTO = PublicEntryAddOnDTO.omit({
  publicAddOnId: true,
  createdAt: true,
  price: true,
}).partial();
