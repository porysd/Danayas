import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";

export const routes = [["/auth", authRoutes], ["/users", userRoutes]] as const;
export type AppRoutes = (typeof routes)[number];