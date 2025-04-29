import { z } from "zod";

export const FaqsDTO = z.object({
  faqsId: z.number().int().openapi({
    description: "The ID of the FAQ",
    example: 1,
  }),
  question: z.string().openapi({
    description: "The question of the FAQ",
    example: "What is the cancellation policy?",
  }),
  answer: z.string().openapi({
    description: "The answer to the FAQ",
    example: "You can cancel your booking up to 24 hours in advance.",
  }),
  createdAt: z.string().openapi({
    description: "The date when the FAQ was created",
    example: new Date().toUTCString(),
  }),
  updatedAt: z.string().openapi({
    description: "The date where the faqs was last updated",
    example: new Date().toUTCString(),
  }),
});

export const CreateFaqsDTO = FaqsDTO.omit({
  faqsId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateFaqsDTO = FaqsDTO.omit({
  faqsId: true,
  createdAt: true,
  updatedAt: true,
}).partial();
