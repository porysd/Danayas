import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { BookingsTable } from "../schemas/Booking";
import { BookingDTO, GetBookingDTO, CreateBookingDTO} from "../dto/bookingDTO";
import { eq } from "drizzle-orm";

export default new OpenAPIHono().openapi(
  createRoute({
    tags: ["Bookings"],
    summary: "Get all bookings",
    method: "get",
    path: "/bookings",
    request: {
      query: z.object({
        limit: z.coerce.number().nonnegative().default(50).openapi({
          example: 50,
          description: "Limit that the server will give",
        }),
        page: z.coerce.number().nonnegative().default(1).openapi({
          example: 1,
          description: "Page to get",
        }),
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
)
.openapi(
  createRoute({
    tags: ["Bookings"],
    method: "get",
    path: "/booking/:id",
    summary: "Retrieve the booking by ID",
    request: {
      params: z.object({
        id: z.coerce.number().openapi({ description: "Booking ID" }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: GetBookingDTO,
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
  
    return c.json(GetBookingDTO.parse(booking));
  }
)
.openapi(
    createRoute({
      tags: ["Bookings"],
      method: "post",
      path: "/booking",
      summary: "Create a new booking",
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
      const body = CreateBookingDTO.parse(await c.req.json());
      await db.insert(BookingsTable).values(body).execute();
      return c.json(body);
    }
  )