import { Hono } from "hono";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import inquiryRoutes from "./routes/inquiryRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import reportRoutes from "./routes/reportRoutes";
import reservationRoutes from "./routes/reservationRoutes";

const app = new Hono();

app.route("/auth", authRoutes);
app.route("/bookings", bookingRoutes);
app.route("/inquiries", inquiryRoutes);
app.route("/payments", paymentRoutes);
app.route("/reports", reportRoutes);
app.route("/reservations", reservationRoutes);

export default app;
