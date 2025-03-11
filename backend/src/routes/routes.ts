import { Hono } from "hono";
import usersRoutes from './userRoutes';
import roleRoutes from './roleRoutes';
import bookingRoutes from "./bookingRoutes";
import packageRoutes from "./packageRoutes";
import discountRoutes from "./discountRoutes";
import bookingAddOnRoutes from "./bookingAddOnRoutes";
import billingRoutes from "./billingRoutes";
// import contentManagementRoutes from "./contentManagementRoutes";
import paymentRoutes from "./paymentRoutes";
// import reportRoutes from "./reportRoutes";


export const routes = [usersRoutes, roleRoutes, 
                       bookingRoutes, packageRoutes,
                       bookingAddOnRoutes, discountRoutes,
                       paymentRoutes, billingRoutes] as const;

export type AppRoutes = (typeof routes)[number];