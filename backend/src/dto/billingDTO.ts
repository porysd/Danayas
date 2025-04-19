import { z } from "@hono/zod-openapi";

export const BillingDTO = z.object({
    billingId: z.number().int().openapi({
        description: "The ID of the billing",
        example: 1,
    }),
    paymentId: z.number().int().openapi({
        description: "The ID of the payment",
        example: 1,
    }),
    checkInDate: z.string().openapi({
        description: "The check-in date of the booking (MM-DD-YYYY)",
        example: "03-19-2025",
    }),
    checkOutDate: z.string().openapi({
        description: "The check-out date of the booking (MM-DD-YYYY)",
        example: "03-20-2025",
    }),
    mode: z.enum(["day-time", "night-time", "whole-day"]).openapi({
        description: "The mode of the booking",
        example: "day-time",
    }),
    arrivalTime: z.string().openapi({
        description: "The arrival time of the booking (HH:MM AM/PM)",
        example: "7:00 PM",
    }),
    catering: z.coerce.boolean().openapi({
        description: "Indicates whether catering is included",
        example: true,
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
    emailAddress: z.string().email().nullable().optional().openapi({
        description: "The email address of the person who made the booking",
        example: "johndoe@example.com",
    }),
    address: z.string().nullable().optional().openapi({
        description: "The address of the person who made the booking",
        example: "123 Main St, City, Country",
    }),
    inclusion: z.string().openapi({
        description: "The inclusions of the package",
        example: "Inclusion details",
    }),
    price: z.number().openapi({
        description: "The price of the package",
        example: 1000.00,
    }),
    paymentTerms: z.enum(["installment", "full-payment"]).openapi({
        description: "The payment terms for the booking",
        example: "installment",
    }),
    totalAmount: z.number().openapi({
        description: "The total amount due for the booking",
        example: 2000.00,
    }),
    reference: z.string().nullable().optional().openapi({
        description: "The reference number for the payment",
        example: "REF123456",
    }),
    imageUrl: z.string().nullable().optional().openapi({
        description: "The URL of the payment image",
        example: "https://example.com/image.jpg",
    }),
    createdAt: z.string().openapi({
        description: "The date and time when the billing was created",
        example: "2025-03-19T12:00:00Z",
    }),
})
export const CreateBillingDTO = BillingDTO.pick({
    paymentId: true,
});