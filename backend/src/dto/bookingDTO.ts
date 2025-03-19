import { z } from "@hono/zod-openapi";

export const BookingDTO = z.object({
    bookingId: z.number().int().openapi({
        description: "The ID of the booking",
        example: 1,
    }),
    userId: z.number().int().openapi({
        description: "The ID of the user who made the booking",
        example: 3,
    }),
    createdBy: z.number().int().openapi({
        description: "The ID of the admin or staff who created the booking",
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
    packageId: z.number().int().openapi({
        description: "The ID of the package selected",
        example: 3,
    }),
    firstName: z.string().openapi({
        description: "The first name of the person who made the booking",
        example: "John",
    }),
    lastName: z.string().openapi({
        description: "The last name of the person who made the booking",
        example: "Doe",
    }),
    arrivalTime: z.string().openapi({
      description: "The arrival time of the booking (HH:MM AM/PM)",
      example: "7:00 PM",
    }),
    eventType: z.string().openapi({
        description: "The type of event for the booking",
        example: "Birthday",
    }),
    numberOfGuest: z.number().int().openapi({
        description: "The number of guests expected",
        example: 50,
    }),
    catering: z.boolean().openapi({
        description: "Indicates whether catering is included",
        example: true,
    }),
    contactNo: z.string().openapi({
        description: "The contact number of the person who made the booking",
        example: "+639351573422",
    }),
    emailAddress: z.string().email().openapi({
        description: "The email address of the person who made the booking",
        example: "johndoe@example.com",
    }),
    address: z.string().openapi({
        description: "The address of the person who made the booking",
        example: "123 Main St, City, Country",
    }),
    discountPromoId: z.number().int().openapi({
        description: "The ID of the discount",
        example: 5,
    }),
    paymentTerms: z.enum(["installment", "full-payment"]).openapi({
        description: "The payment terms of the booking",
        example: "installment",
    }),
    totalAmountDue: z.number().openapi({
        description: "The total amount due for the booking",
        example: 12000,
    }),
    bookStatus: z.enum(["pending", "confirmed", "cancelled", "completed"]).openapi({
        description: "The status of the booking",
        example: "pending",
    }),
    reservationType: z.enum(["online", "walk-in"]).openapi({
        description: "The type of reservation",
        example: "online",
    }),
    createdAt: z.string().openapi({
        description: "The date when the booking was created",
        example: new Date().toISOString(),
    }),
});

export const UpdateBookingDTO = BookingDTO.omit({
    bookingId: true,
    createdAt: true,
    userId: true,
    createdBy: true
}).partial();

export const CreateBookingDTO = BookingDTO.omit({
    bookingId: true,
    createdAt: true,
}).extend({
    userId: z.number().int().openapi({
        description: "The ID of the user making the booking",
        example: 2,
    }),
    createdBy: z.number().int().openapi({
        description: "The ID of the admin or staff creating the booking",
        example: 1,
    }),
    catering: z.coerce.number().openapi({
        description: "Indicates whether catering is included (0 = No, 1 = Yes",
        example: 1 
    }),
});

export const GetBookingDTO = BookingDTO.extend({
    catering: z.coerce.boolean()
});