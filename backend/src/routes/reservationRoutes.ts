import { Hono } from 'hono';

const reservationRoutes = new Hono();

reservationRoutes.post("/", async (c) => {
    const reservationDetails = await c.req.json();

    return c.json({message: "Reservation successful!"});
});

reservationRoutes.put("/:id", async (c) => {
    const { id } = c.req.param();
    const updates = await c.req.json();

    return c.json({ message: `Reservation ${id} updated successfully!` });
});

reservationRoutes.delete("/:id", async (c) => {
    const { id } = c.req.param();

    return c.json({ message: `Reservation ${id} deleted successfully!` });
});

export default reservationRoutes;