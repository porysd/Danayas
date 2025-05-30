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
  data: z.string().optional().openapi({
    description: "The data associated with the action, typically in JSON format",
    example: '{"bookingId": 1, "userId": 3, "status": "pending"}',
  }),
  remarks: z.string().optional().openapi({
    description: "Additional remarks or comments about the action",
    example: "Booking status updated to reserved",
  }),
  createdAt: z.string().openapi({
    description: "The date and time when the action was performed",
    example: new Date().toISOString(),
  }),
});
