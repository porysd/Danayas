import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import packageRoutes from "./packageRoutes";

export const routes = [["/auth", authRoutes], ["/users", userRoutes], ["/packages", packageRoutes]] as const;
export type AppRoutes = (typeof routes)[number];