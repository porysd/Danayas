import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import packageRoutes from "./packageRoutes";
import bookingRoutes from "./bookingRoutes";
import paymentRoutes from "./paymentRoutes";
import discountRoutes from "./discountRoutes";
import catalogAddOnRoutes from "./catalogAddOnRoutes";
import bookingAddOnRoutes from "./bookingAddOnRoutes";
import refundRoutes from "./refundRoutes";
import faqsRoutes from "./faqsRoutes";
import termsAndConditionRoutes from "./termsAndConditionRoutes";
import refundPaymentRoutes from "./refundPaymentRoutes";
import publicEntryRoutes from "./publicEntryRoutes";
import publicEntryRateRoutes from "./publicEntryRateRoutes";
import publicAddOnRoutes from "./publicAddOnRoutes";
import auditLogRoutes from "./auditLogRoutes";
import blockedRoutes from "./blockDatesRoutes";
import path from "path";

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
  { path: "/refund", handler: refundRoutes },
  { path: "/refundPayment", handler: refundPaymentRoutes },
  { path: "/faqs", handler: faqsRoutes },
  { path: "/termAndCondition", handler: termsAndConditionRoutes },
  { path: "/publicentry", handler: publicEntryRoutes },
  { path: "/publicentryrates", handler: publicEntryRateRoutes },
  { path: "/publicentryaddons", handler: publicAddOnRoutes },
  { path: "/auditLog", handler: auditLogRoutes },
  { path: "/blockeddates", handler: blockedRoutes },
] as const;

export type AppRoutes = (typeof routes)[number];
