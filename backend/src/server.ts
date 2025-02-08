import { Hono } from "hono";
import { serve } from "bun";
import { db } from "./config/database";

const app = new Hono();

app.get("/", (c) => c.text("Backend is running!"));

serve({ fetch: app.fetch, port: 3000 });
