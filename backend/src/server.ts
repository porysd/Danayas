import { Hono } from "hono";
import { serve } from "bun";
import { db } from "./config/database";
import { route } from "./routes/routes";
import { routes } from "./routes/routes";
import router from "./routes/userRoutes";

const app = new Hono();

app.get("/", (c) => {
    return c.json({ message: "Working!" })
});

route.forEach((route) => {
    app.route(route.path, route.handler);
});

routes.forEach((route) => {
    app.route("/", route);
});

Bun.serve({
    fetch: app.fetch,
    port: 4000,
})

console.log(`Server running at http://localhost:4000/`);


