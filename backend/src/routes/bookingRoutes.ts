import { Hono } from "hono";

const bookingRoutes = new Hono();

bookingRoutes.get("/" , async (c) => {
    return c.json({message: "All bookings"});
});

bookingRoutes.post("/" , async (c) => {
    return c.json({message: "Booking created"});
});

export default bookingRoutes;