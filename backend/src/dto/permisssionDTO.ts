import { z } from "@hono/zod-openapi";

export const GrantPermissionDTO = z
  .object({
    userId: z.number().openapi({ example: 5 }),
    table: z.string().openapi({ example: "FAQS" }),
    action: z
      .enum(["create", "read", "update", "delete"])
      .openapi({ example: "update" }),
  })
  .openapi("GrantPermissionDTO");

export type GrantPermissionDTO = z.infer<typeof GrantPermissionDTO>;
