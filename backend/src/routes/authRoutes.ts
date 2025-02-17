import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.post("/register", async (c) => {
    const { username, password } = await c.req.json();

    return c.json({message: "User registered successfully!"});
});

authRoutes.post("/login", async (c) => {
    const { username, password } = await c.req.json();

    return c.json({message: "User logged in successfully!"});
}); 

export default authRoutes;
