import { z } from "@hono/zod-openapi";

export const PublicEntryDTO = z.object({
  publicEntryId: z.number().int().openapi({
    description: "ID of the public entry",
    example: 1,
  }),
  userId: z.number().int().openapi({
    description: "ID who created public entry",
    example: 1,
  }),
  discountId: z.number().int().nullable().optional().openapi({
    description: "The ID of the discount",
    example: 2,
  }),
  firstName: z.string().nullable().optional().openapi({
    description: "The first name of the person who made the booking",
    example: "John",
  }),
  lastName: z.string().nullable().optional().openapi({
    description: "The last name of the person who made the booking",
    example: "Doe",
  }),
  contactNo: z.string().nullable().optional().openapi({
    description: "The contact number of the person who made the booking",
    example: "+639351573422",
  }),
  address: z.string().nullable().optional().openapi({
    description: "The address of the person who made the booking",
    example: "123 Main St, City, Country",
  }),
  entryDate: z.string().openapi({
    description: "Entry Date of the public entry",
    example: "03-19-2025",
  }),
  mode: z.enum(["day-time", "night-time"]).openapi({
    description: "Mode of the public entry",
    example: "day-time",
  }),
  reservationType: z.enum(["online", "walk-in"]).nullable().optional().openapi({
    description: "The type of reservation",
    example: "online",
  }),
  numAdults: z.number().int().openapi({
    description: "Number of adults",
    example: 10,
  }),
  numKids: z.number().int().openapi({
    description: "Number of kids",
    example: 10,
  }),
  adultRateId: z.number().int().openapi({
    description: "ID of the rate for adults",
    example: 1,
  }),
  kidRateId: z.number().int().openapi({
    description: "ID of the rate for kids",
    example: 1,
  }),
  adultGuestNames: z.array(z.string()).openapi({
    description: "Names of the adult guests",
    example: ["John Doe", "Jane Doe"],
  }),
  kidGuestNames: z.array(z.string()).openapi({
    description: "Names of the kid guests",
    example: ["Kid One", "Kid Two"],
  }),
  totalAmount: z.number().openapi({
    description: "Total amount of public entry",
    example: 12000.0,
  }),
  amountPaid: z.number().openapi({
    description: "Amount paid so far",
    example: 3000,
  }),
  remainingBalance: z.number().openapi({
    description: "Remaining balance",
    example: 12000,
  }),
  status: z
    .enum([
      "pending",
      "reserved",
      "cancelled",
      "completed",
      "rescheduled",
      "pending-cancellation",
    ])
    .openapi({
      description: "Status of the booking",
      example: "pending",
    }),
  paymentTerms: z.enum(["installment", "full-payment"]).openapi({
    description: "The payment terms of the booking",
    example: "installment",
  }),
  publicPaymentStatus: z.enum(["paid", "partially-paid", "unpaid"]).openapi({
    description: "Booking payment status",
    example: "unpaid",
  }),
  cancelCategory: z
    .enum(["natural-disaster", "others"])
    .nullable()
    .optional()
    .openapi({
      description: "The category of cancellation",
      example: "others",
    }),
  cancelReason: z.string().nullable().optional().openapi({
    description: "The reason for cancellation",
    example: "Change of plans",
  }),
  createdAt: z.string().openapi({
    description: "The date when the booking was created",
    example: new Date().toISOString(),
  }),
});

export const CreatePublicEntryDTO = PublicEntryDTO.omit({
  publicEntryId: true,
  totalAmount: true,
  status: true,
  adultRateId: true,
  kidRateId: true,
  publicPaymentStatus: true,
  amountPaid: true,
  remainingBalance: true,
  cancelReason: true,
  cancelCategory: true,
  createdAt: true,
});

export const UpdatePublicEntryDTO = PublicEntryDTO.omit({
  publicEntryId: true,
  userId: true,
  discountId: true,
  adultRateId: true,
  kidRateId: true,
  numAdults: true,
  numKids: true,
  adultGuestNames: true,
  kidGuestNames: true,
  publicPaymentStatus: true,
  totalAmount: true,
  paymentTerms: true,
  amountPaid: true,
  remainingBalance: true,
  cancelReason: true,
  cancelCategory: true,
  createdAt: true,
}).partial();
