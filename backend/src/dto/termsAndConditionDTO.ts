import { z } from "zod";

export const termsConditionDTO = z.object({
  termsId: z.number().int().openapi({
    description: "The ID of the terms and conditions",
    example: 1,
  }),
  content: z.string().openapi({
    description: "No cancellation policy",
    example:
      "We're not allowing you to cancel your reservation once you reserve.",
  }),
  createdAt: z.string().openapi({
    description: "The date when the terms and condition was created",
    example: new Date().toUTCString(),
  }),
  updatedAt: z.string().openapi({
    description: "The date where the terms and condition was last updated",
    example: new Date().toUTCString(),
  }),
});

export const CreateTermsAndCondtionDTO = termsConditionDTO.omit({
  termsId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTermsAndCondtionDTO = termsConditionDTO
  .omit({
    termsId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();
