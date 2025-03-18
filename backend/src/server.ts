import { Hono } from "hono";
import { serve } from "bun";
import { db } from "./config/database";
import { routes } from "./routes/routes";
import seedRoles from "./config/seed";

const app = new Hono();

/*
// To create Admin, Staff, Customer roles (fake data)
await seedRoles().then(() => {
  console.log("Roles seeded successfully.");
}).catch((err) => {
  console.error("Error seeding roles:", err);
});
*/

// To create Admin, Staff, Customer roles (fake data)

try {
  await seedRoles();
} catch (err) {
  console.error("Error seeding roles:", err);
}

// Route check if working or not
app.get("/", (c) => {
  return c.json({ message: "Working!" });
});

// Main routes
routes.forEach((route) => {
  app.route("/", route);
});

Bun.serve({
  fetch: app.fetch,
  port: 3000,
});

console.log(`Server running at http://localhost:3000/`);
