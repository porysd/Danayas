import { z } from "@hono/zod-openapi";

export const ErrorSchema = z.object({
  code: z.number().openapi({ 
    description: "Code error", 
    example: 404 
  }),
  message: z.string().openapi({
    description: "Code message",
    example: "Resource not Found!!",
  }),
});
