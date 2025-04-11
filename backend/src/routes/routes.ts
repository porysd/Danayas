import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import packageRoutes from "./packageRoutes";
import bookingRoutes from "./bookingRoutes";
import paymentRoutes from "./paymentRoutes";
import discountRoutes from "./discountRoutes";

// Define all routes with distinct paths
export const routes = [
  { path: "/auth", handler: authRoutes },
  { path: "/users", handler: userRoutes },
  { path: "/packages", handler: packageRoutes },
  { path: "/bookings", handler: bookingRoutes },
  { path: "/payments", handler: paymentRoutes },
  { path: "/discounts", handler: discountRoutes}
] as const;

export type AppRoutes = (typeof routes)[number];