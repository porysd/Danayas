import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import packageRoutes from "./packageRoutes";
import bookingRoutes from "./bookingRoutes";
import paymentRoutes from "./paymentRoutes";
import discountRoutes from "./discountRoutes";
import catalogAddOnRoutes from "./catalogAddOnRoutes";
import bookingAddOnRoutes from "./bookingAddOnRoutes";
import transactionRoutes from "./transactionRoutes";
import faqsRoutes from "./faqsRoutes";

// Define all routes with distinct paths
export const routes = [
  { path: "/auth", handler: authRoutes },
  { path: "/users", handler: userRoutes },
  { path: "/packages", handler: packageRoutes },
  { path: "/bookings", handler: bookingRoutes },
  { path: "/payments", handler: paymentRoutes },
  { path: "/discounts", handler: discountRoutes },
  { path: "/catalogaddon", handler: catalogAddOnRoutes },
  { path: "/bookingaddon", handler: bookingAddOnRoutes },
  { path: "/transaction", handler: transactionRoutes },
  { path: "/faqs", handler: faqsRoutes },
] as const;

export type AppRoutes = (typeof routes)[number];
