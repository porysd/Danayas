import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { BookingsTable } from "../schemas/Booking";
import { BookingDTO, CreateBookingDTO, UpdateBookingDTO } from "../dto/bookingDTO";
import { eq } from "drizzle-orm";
import { processBookingData } from "../utils/dateHelpers";

export default new OpenAPIHono()
  .openapi(
    createRoute({
      tags: ["Bookings"],
      summary: "Get all bookings",
      method: "get",
      path: "/bookings",
      request: {
        query: z.object({
          limit: z.coerce.number().nonnegative().openapi({
            example: 50,
            description: "Limit that the server will give",
          }),
          page: z.coerce.number().nonnegative().openapi({
            example: 1,
            description: "Page to get",
          }),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: BookingDTO.array(),
            },
          },
          description: "Retrieve all bookings",
        },
        400: {
          description: "Bad request!",
        },
        500: {
          description: "Internal server error",
        },
      },
    }),
    async (c) => {
      const { limit, page } = c.req.valid("query");

      const bookings = await db.query.BookingsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const allBookings = bookings.map((booking) => BookingDTO.parse(booking));

      return c.json({ total: bookings.length, items: allBookings });
    }
  )
  .openapi(
    createRoute({
      tags: ["Bookings"],
      method: "get",
      path: "/booking/:id",
      summary: "Retrieve Booking by ID",
      request: {
        params: z.object({
          id: z.coerce.number().openapi({ description: "Booking ID" }),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: BookingDTO,
            },
          },
          description: "Retrieve the booking by ID",
        },
        404: {
          description: "Booking not found",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const booking = await db.query.BookingsTable.findFirst({
        where: eq(BookingsTable.bookingId, id),
      });
      if (!booking) {
        return c.json({ error: "Booking not found" }, 404);
      }
      return c.json(BookingDTO.parse(booking));
    }
  )
  .openapi(
    createRoute({
      tags: ["Bookings"],
      method: "post",
      path: "/booking",
      summary: "Create Booking",
      request: {
        body: {
          description: "Booking credentials",
          required: true,
          content: {
            "application/json": { schema: CreateBookingDTO },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: CreateBookingDTO,
            },
          },
          description: "Booking Created",
        },
      },
    }),
    async (c) => {
      const parsedBody = CreateBookingDTO.parse(await c.req.json());

      const { userId, createdBy } = parsedBody;

      const processedBody = {
        ...processBookingData(parsedBody),
        userId,
        createdBy,
        catering: parsedBody.catering ? 1 : 0,
    };
      const insertedBooking = (await db.insert(BookingsTable).values(processedBody).returning().execute())[0];
      return c.json({
        ...insertedBooking,
        catering: insertedBooking.catering === 1 ? 1 : 0 as 0 | 1,
      });
    }
  )
  .openapi(
      createRoute({
        tags: ["Bookings"],
        method: "patch",
        path: "/:id",
        summary: "Update Booking by ID",
        request: {
          body: {
            description: "Update Booking",
            required: true,
            content: {
              "application/json": { schema: UpdateBookingDTO },
            },
          },
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: BookingDTO,
              },
            },
            description: "User Updated",
          },
          400: {
            description: "Invalid user ID",
          },
        },
      }),
      async (c) => {
        const bookingId = Number(c.req.param("id"));
  
        const requestData = UpdateBookingDTO.parse(await c.req.json());
        const processedData = processBookingData(requestData);

        await db
          .update(BookingsTable)
          .set(processedData)
          .where(eq(BookingsTable.bookingId, bookingId))
          .execute();
        return c.text("Booking Updated");
      }
    )
    .openapi(
      createRoute({
        tags: ["Bookings"],
        method: "patch",
        path: "/:id/status",
        summary: "Update Booking Status by ID",
        request: {
          body: {
            description: "Update Booking Status",
            required: true,
            content: {
              "application/json": {
                schema: z.object({
                  bookStatus: z.enum(["pending", "confirmed", "cancelled", "completed"]),
                }),
              },
            },
          },
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: BookingDTO.pick({ bookStatus: true }),
              },
            },
            description: "Booking Status Updated",
          },
          400: {
            description: "Invalid booking ID or status",
          },
        },
      }),
      async (c) => {
        const bookingId = Number(c.req.param("id"));
        const { bookStatus } = await c.req.json();
        
        await db
          .update(BookingsTable)
          .set({ bookStatus })
          .where(eq(BookingsTable.bookingId, bookingId))
          .execute();
        
        return c.json({ message: "Booking status updated", bookStatus });
      }
    )
    .openapi(
      createRoute({
        tags: ["Bookings"],
        method: "delete",
        path: "/:id",
        summary: "Delete booking by ID",
        responses: {
          200: {
            description: "Booking Deleted",
          },
          400: {
            description: "Invalid bookingId",
          },
        },
      }),
      async (c) => {
        const bookingId = Number(c.req.param("id"));
        await db.delete(BookingsTable)
          .where(eq(BookingsTable.bookingId, bookingId))
          .execute();
        return c.text("Booking Deleted!");
      }
    )