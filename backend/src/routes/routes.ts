import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import packageRoutes from "./packageRoutes";
import bookingRoutes from "./bookingRoutes"

export const routes = [["/auth", authRoutes], ["/users", userRoutes], ["/packages", packageRoutes], ["/bookings", bookingRoutes]] as const;
export type AppRoutes = (typeof routes)[number];