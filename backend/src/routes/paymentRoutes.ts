import { Hono } from "hono";

const paymentRoutes = new Hono();

paymentRoutes.get("/" , async (c) => {
    return c.json({message: "Payment history"});
});

paymentRoutes.post("/" , async (c) => {
    return c.json({message: "Payment processed"});
});

export default paymentRoutes;