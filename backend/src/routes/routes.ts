import { Hono } from "hono";
import usersRoutes from './userRoutes'
import authRoutes from "./authRoutes";
import bookingRoutes from "./bookingRoutes";
import inquiryRoutes from "./inquiryRoutes";
import paymentRoutes from "./paymentRoutes";
import reportRoutes from "./reportRoutes";
import reservationRoutes from "./reservationRoutes";

export const route = [
    { path: "/auth", handler: authRoutes },
    { path: "/bookings", handler: bookingRoutes },
    { path: "/inquiries", handler: inquiryRoutes },
    { path: "/payments", handler: paymentRoutes },
    { path: "/reports", handler: reportRoutes },
    { path: "/reservations", handler: reservationRoutes },
];

export const routes = [usersRoutes] as const;

export type AppRoutes = (typeof routes)[number];