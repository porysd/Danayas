import { z } from "@hono/zod-openapi";

export const AuditLogDTO = z.object({
  auditLogId: z.number().int().openapi({
    description: "The ID of the audit log",
    example: 1,
  }),
  userId: z.number().int().openapi({
    description: "The ID of the user who performed the action",
    example: 3,
  }),
  action: z.enum(["create", "read", "update", "delete", "login", "logout", "status-change", "refund-issued", "payment-verified"]).openapi({
    description: "the action performed by the user",
    example: "create",
  }),
  tableName: z.string().openapi({
    description: "The name of the table where the action was performed",
    example: "Bookings",
  }),
  recordId: z.number().int().openapi({
    description: "The ID of the record that was affected",
    example: 1,
  }),
  createdAt: z.string().openapi({
    description: "The date and time when the action was performed",
    example: new Date().toISOString(),
  }),
});
