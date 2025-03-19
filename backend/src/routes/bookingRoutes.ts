import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { BookingsTable } from "../schemas/Booking";
import { BookingDTO, GetBookingDTO } from "../dto/bookingDTO";

export default new OpenAPIHono().openapi(
  createRoute({
    tags: ["Bookings"],
    summary: "Get all bookings",
    method: "get",
    path: "/",
    request: {
      query: z.object({
        limit: z.coerce.number().nonnegative().optional().default(50),
        page: z.coerce.number().nonnegative().optional().default(1),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: GetBookingDTO.array(),
          },
        },
        description: "Retrieve all bookings",
      },
      400: {
        description: "Bad request!",
      },
    },
  }),
  async (c) => {
    const { limit, page } = c.req.valid("query");

    const bookings = await db.query.BookingsTable.findMany({
      limit,
      offset: (page - 1) * limit,
    });

    const allBookings = bookings.map((booking) => GetBookingDTO.parse(booking));

    return c.json({
      total: bookings.length,
      items: allBookings,
    });
  }
);