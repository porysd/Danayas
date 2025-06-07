import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  PaymentDTO,
  CreatePaymentDTO,
  UpdatePaymentDTO,
} from "../dto/paymentDTO";
import db from "../config/database";
import {
  BookingsTable,
  PaymentsTable,
  UsersTable,
  PublicEntryTable,
  AuditLogsTable,
  RefundsTable,
} from "../schemas/schema";
import { desc, and, ne, eq, like, or } from "drizzle-orm";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { revokePermission, verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";
import fs from "fs/promises";
import path from "path";
import { Resend } from "resend";

const paymentRoutes = new OpenAPIHono<AuthContext>();

paymentRoutes.use("/*", authMiddleware);

paymentRoutes.openapi(
  createRoute({
    tags: ["Payments"],
    summary: "Retrieve all the payments",
    method: "get",
    path: "/",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      query: z.object({
        limit: z.coerce.number().nonnegative().min(1).default(20).openapi({
          example: 50,
          description: "Limit that the server will give",
        }),
        page: z.coerce.number().nonnegative().min(1).default(1).openapi({
          example: 1,
          description: "Page to get",
        }),
      }),
    },
    responses: {
      200: {
        description: "Retrieved all the payments",
        content: {
          "application/json": {
            schema: z.object({
              total: z.number(),
              items: PaymentDTO.array(),
            }),
          },
        },
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "No payments found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PAYMENT", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get payments.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const payments = await db.query.PaymentsTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      // if (!payments || payments.length === 0) {
      //   throw new NotFoundError("No payments found.");
      // }

      return c.json({
        total: payments.length,
        items: payments,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

paymentRoutes.openapi(
  createRoute({
    tags: ["Payments"],
    summary: "Get Payment By ID",
    method: "get",
    path: "/:id",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      params: z.object({
        id: z.coerce.number().openapi({ description: "Id to find" }),
      }),
    },
    responses: {
      200: {
        description: "Successful payment retrieval",
        content: {
          "application/json": {
            schema: PaymentDTO,
          },
        },
      },
      400: {
        description: "Invalid payment ID",
      },
      404: {
        description: "Payment not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PAYMENT", "read");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get payment.");
      }

      const { id } = c.req.valid("param");

      const dbPayment = await db.query.PaymentsTable.findFirst({
        where: eq(PaymentsTable.paymentId, id),
      });

      if (!dbPayment) {
        throw new NotFoundError("Payment not found");
      }

      return c.json(dbPayment);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

paymentRoutes.openapi(
  createRoute({
    tags: ["Payments"],
    summary: "Create Payments",
    method: "post",
    path: "/",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      body: {
        content: {
          "multipart/form-data": {
            schema: CreatePaymentDTO,
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: PaymentDTO,
          },
        },
        description: "Successful payment creation",
      },
      400: {
        description: "Invalid payment data",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PAYMENT", "create");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create payments.");
      }

      const formData = new FormData();

      const body = await c.req.parseBody();
      const file = body["imageUrl"] as File;
      let imageUrl = null;

      const parsed = CreatePaymentDTO.parse(body);
      const {
        bookingId,
        publicEntryId,
        paymentMethod,
        tenderedAmount,
        senderName,
      } = parsed;

      const user = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userId, userId),
      });

      if (!user) {
        throw new NotFoundError("User not found.");
      }

      const isCustomer = user.role === "customer";
      const isEmployee = user.role === "admin" || user.role === "staff";

      if (paymentMethod === "gcash") {
        if (!parsed.reference || !parsed.imageUrl) {
          return c.json(
            {
              error: "Reference and imageUrl are required for online payments",
            },
            400
          );
        }

        if (!file) {
          throw new BadRequestError("No file uploaded");
        }

        const allowedMimeTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/jfif",
        ];

        if (!allowedMimeTypes.includes(file.type)) {
          throw new BadRequestError(
            "Invalid file type, Only Jpeg, Png, and Jpg are allowed"
          );
        }

        const uploadDir = path.join(process.cwd(), "public", "PaymentImages");
        await fs.mkdir(uploadDir, { recursive: true });

        const uniqueFileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, uniqueFileName);

        const fileBuffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(fileBuffer));

        imageUrl = `/PaymentImages/${uniqueFileName}`;
      }

      if (paymentMethod === "cash" && (parsed.reference || parsed.imageUrl)) {
        return c.json(
          {
            error: "Reference and imageUrl are not required for cash payments",
          },
          400
        );
      }

      if (bookingId) {
        //Handle Private Booking
        // Select the booking by bookingId
        const booking = await db.query.BookingsTable.findFirst({
          where: eq(BookingsTable.bookingId, bookingId),
        });

        if (!booking) {
          throw new NotFoundError("Booking not found.");
        }

        if (
          booking.bookStatus === "cancelled" ||
          booking.bookStatus === "completed"
        ) {
          return c.json(
            { error: "Cannot create payment for this booking status" },
            400
          );
        }

        if (booking.bookingPaymentStatus === "paid") {
          return c.json({ error: "Booking already paid" }, 400);
        }

        const latestPayment = await db.query.PaymentsTable.findFirst({
          where: eq(PaymentsTable.bookingId, bookingId),
          orderBy: [desc(PaymentsTable.createdAt)],
        });

        if (latestPayment?.paymentStatus === "pending") {
          return c.json({ error: "Previous payment is still pending" }, 400);
        }

        const remainingBalance = booking.remainingBalance;
        const paymentTerms = booking.paymentTerms;
        const isInstallment = paymentTerms === "installment";
        const isFullPayment = paymentTerms === "full-payment";

        if (
          isFullPayment &&
          paymentMethod === "gcash" &&
          tenderedAmount !== undefined &&
          !(tenderedAmount - booking.totalAmount === 0) &&
          !latestPayment
        ) {
          return c.json(
            {
              error: `Full payment must be equal to the total amount ${booking.totalAmount}`,
            },
            400
          );
        }

        if (
          tenderedAmount !== undefined &&
          tenderedAmount > remainingBalance &&
          paymentMethod === "gcash"
        ) {
          return c.json(
            { error: "Tendered amount is greater than the remaining balance" },
            400
          );
        }

        // If full payment does every extra add ons or pax required to be paid in full or not
        if (
          isInstallment &&
          tenderedAmount !== undefined &&
          tenderedAmount < 2000 &&
          !latestPayment
        ) {
          return c.json({ error: "Minimum down payment amount is 2000" }, 400);
        }

        if (tenderedAmount === undefined) {
          return c.json({ error: "Tendered amount is required" }, 400);
        }
        const changeAmount = Math.max(tenderedAmount - remainingBalance, 0);
        const netPaidAmount = tenderedAmount - changeAmount;

        const created = await db.transaction(async (tx) => {
          const paymentStatus = isEmployee ? "valid" : "pending";
          // Ensure required fields are not undefined
          if (
            parsed.paymentMethod === undefined ||
            tenderedAmount === undefined ||
            netPaidAmount === undefined
          ) {
            throw new BadRequestError("Missing required payment fields.");
          }
          const paymentData: any = {
            bookingId: parsed.bookingId,
            paymentMethod: parsed.paymentMethod,
            senderName: parsed.senderName,
            tenderedAmount,
            changeAmount,
            netPaidAmount,
            paymentStatus: paymentStatus,
            imageUrl,
          };

          const newPayment = (
            await tx
              .insert(PaymentsTable)
              .values(paymentData)
              .returning()
              .execute()
          )[0];

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: userId,
              action: "create",
              tableName: "PAYMENTS",
              recordId: newPayment.paymentId,
              data: JSON.stringify(newPayment),
              remarks: "Payment created for booking",
              createdAt: new Date().toISOString(),
            })
            .execute();

          // For Private
          if (isEmployee) {
            const updatedAmountPaid = booking.amountPaid + netPaidAmount;
            const updatedRemainingBalance =
              booking.remainingBalance - netPaidAmount;
            const updatedBookingPaymentStatus =
              updatedRemainingBalance === 0 ? "paid" : "partially-paid";

            const customer = await db.query.UsersTable.findFirst({
              where: eq(UsersTable.userId, booking.userId),
            });

            const resend = new Resend(process.env.RESEND_API_KEY);
            const notifyResult = await resend.emails.send({
              from: "Danayas Resort <onboarding@resend.dev>",
              to: ["realrickyjones@gmail.com"], // Replace with Customer email
              subject: `Payment Recorded for Your Reservation at Danayas Resort`,
              replyTo: "Danayas@email.com", // Replace with Danayas email
              html: `
                    <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
                      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                          <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
                          <p style="margin: 5px 0 0; color: #fdfaf6;">Payment Notification</p>
                        </div>
                        <div style="padding: 30px;">
                          <p style="font-size: 16px;">Hello ${customer?.firstName},</p>
                          <p style="font-size: 15px;">
                            This is to inform you that a payment has been added to your reservation by our staff.
                          </p>
                          <table style="width: 100%; margin-top: 20px; font-size: 14px;">
                            <tr>
                              <td style="padding: 6px 0; font-weight: bold;">Payment Method:</td>
                              <td style="padding: 6px 0;">${paymentMethod}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-weight: bold;">Amount Paid:</td>
                              <td style="padding: 6px 0;">₱${netPaidAmount.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-weight: bold;">Change Returned:</td>
                              <td style="padding: 6px 0;">₱${changeAmount.toFixed(2)}</td>
                            </tr>
                          </table>
                          <p style="margin-top: 20px; font-size: 14px;">Thank you for choosing Danayas Resort. Please keep this record for reference.</p>
                          <p style="margin-top: 30px; font-size: 13px; color: #999;">
                            Sent automatically by the website on ${new Date().toLocaleString()}.
                          </p>
                        </div>
                        <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                          <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
                          <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
                        </div>
                      </div>
                    </div>
                  `,
            });

            await tx
              .update(BookingsTable)
              .set({
                amountPaid: updatedAmountPaid,
                remainingBalance: updatedRemainingBalance,
                bookingPaymentStatus: updatedBookingPaymentStatus,
                bookStatus: "reserved",
              })
              .where(eq(BookingsTable.bookingId, bookingId))
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "BOOKINGS",
                recordId: bookingId,
                data: JSON.stringify({
                  amountPaid: updatedAmountPaid,
                  remainingBalance: updatedRemainingBalance,
                  bookingPaymentStatus: updatedBookingPaymentStatus,
                  bookStatus: "reserved",
                }),
                remarks: "Updated booking due to payment creation",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
          return newPayment;
        });
        return c.json(PaymentDTO.parse(created), 201);
      } else if (publicEntryId) {
        // Handle Public Booking
        const publics = await db.query.PublicEntryTable.findFirst({
          where: eq(PublicEntryTable.publicEntryId, publicEntryId),
        });

        if (!publics) {
          throw new NotFoundError("Public Entry not found.");
        }

        if (publics.status === "cancelled" || publics.status === "completed") {
          return c.json(
            { error: "Cannot create payment for this booking status" },
            400
          );
        }

        if (publics.publicPaymentStatus === "paid") {
          return c.json({ error: "Public Entry already paid" }, 400);
        }

        const latestPublicPayment = await db.query.PaymentsTable.findFirst({
          where: eq(PaymentsTable.publicEntryId, publicEntryId),
          orderBy: [desc(PaymentsTable.createdAt)],
        });

        if (latestPublicPayment?.paymentStatus === "pending") {
          return c.json({ error: "Previous payment is still pending" }, 400);
        }

        const publicBalance = publics.remainingBalance;
        const publicPayterms = publics.paymentTerms;
        const publicInstallment = publicPayterms === "installment";
        const publicFullPayment = publicPayterms === "full-payment";

        if (
          publicFullPayment &&
          tenderedAmount !== undefined &&
          !(tenderedAmount - publics.totalAmount === 0) &&
          !latestPublicPayment
        ) {
          return c.json(
            { error: "Fullpayment must be equal to the total amount" },
            400
          );
        }

        if (
          tenderedAmount !== undefined &&
          tenderedAmount > publicBalance &&
          paymentMethod === "gcash"
        ) {
          return c.json(
            { error: "Tendered amount is greater than the remaining balance" },
            400
          );
        }

        // If full payment does every extra add ons or pax required to be paid in full or not
        if (
          publicInstallment &&
          tenderedAmount !== undefined &&
          tenderedAmount < 200 &&
          !latestPublicPayment
        ) {
          return c.json({ error: "Minimum down payment amount is 200" }, 400);
        }

        if (tenderedAmount === undefined) {
          return c.json({ error: "Tendered amount is required" }, 400);
        }
        const changeAmount = Math.max(tenderedAmount - publicBalance, 0);
        const netPaidAmount = tenderedAmount - changeAmount;

        const created = await db.transaction(async (tx) => {
          const paymentStatus = isEmployee ? "valid" : "pending";
          // Ensure required fields are not undefined
          if (
            parsed.paymentMethod === undefined ||
            tenderedAmount === undefined ||
            netPaidAmount === undefined
          ) {
            throw new BadRequestError("Missing required payment fields.");
          }
          const paymentData: any = {
            publicEntryId: parsed.publicEntryId,
            paymentMethod: parsed.paymentMethod,
            senderName: parsed.senderName,
            tenderedAmount,
            changeAmount,
            netPaidAmount,
            paymentStatus: paymentStatus,
            imageUrl,
          };

          const newPayment = (
            await tx
              .insert(PaymentsTable)
              .values(paymentData)
              .returning()
              .execute()
          )[0];

          await tx
            .insert(AuditLogsTable)
            .values({
              userId: userId,
              action: "create",
              tableName: "PAYMENTS",
              recordId: newPayment.paymentId,
              data: JSON.stringify(newPayment),
              remarks: "Payment created for public entry",
              createdAt: new Date().toISOString(),
            })
            .execute();

          // For Public
          if (isEmployee) {
            const updatedAmountPaid = publics.amountPaid + netPaidAmount;
            const updatePublicBalance =
              publics.remainingBalance - netPaidAmount;
            const updatePublicStatus =
              updatePublicBalance === 0 ? "paid" : "partially-paid";

            const customer = await db.query.UsersTable.findFirst({
              where: eq(UsersTable.userId, publics.userId),
            });

            const resend = new Resend(process.env.RESEND_API_KEY);
            const notifyResult = await resend.emails.send({
              from: "Danayas Resort <onboarding@resend.dev>",
              to: ["realrickyjones@gmail.com"], // Replace with Customer email
              subject: `Payment Recorded for Your Reservation at Danayas Resort`,
              replyTo: "Danayas@email.com", // Replace with Danayas email
              html: `
                      <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                          <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
                            <p style="margin: 5px 0 0; color: #fdfaf6;">Payment Notification</p>
                          </div>
                          <div style="padding: 30px;">
                            <p style="font-size: 16px;">Hello ${customer?.firstName},</p>
                            <p style="font-size: 15px;">
                              This is to inform you that a payment has been added to your reservation by our staff.
                            </p>
                            <table style="width: 100%; margin-top: 20px; font-size: 14px;">
                              <tr>
                                <td style="padding: 6px 0; font-weight: bold;">Payment Method:</td>
                                <td style="padding: 6px 0;">${paymentMethod}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-weight: bold;">Amount Paid:</td>
                                <td style="padding: 6px 0;">₱${netPaidAmount.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-weight: bold;">Change Returned:</td>
                                <td style="padding: 6px 0;">₱${changeAmount.toFixed(2)}</td>
                              </tr>
                            </table>
                            <p style="margin-top: 20px; font-size: 14px;">Thank you for choosing Danayas Resort. Please keep this record for reference.</p>
                            <p style="margin-top: 30px; font-size: 13px; color: #999;">
                              Sent automatically by the website on ${new Date().toLocaleString()}.
                            </p>
                          </div>
                          <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
                            <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
                          </div>
                        </div>
                      </div>
                    `,
            });

            await tx
              .update(PublicEntryTable)
              .set({
                amountPaid: updatedAmountPaid,
                remainingBalance: updatePublicBalance,
                publicPaymentStatus: updatePublicStatus,
                status: "reserved",
              })
              .where(eq(PublicEntryTable.publicEntryId, publicEntryId))
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "PUBLIC_ENTRY",
                recordId: publicEntryId,
                data: JSON.stringify({
                  amountPaid: updatedAmountPaid,
                  remainingBalance: updatePublicBalance,
                  publicPaymentStatus: updatePublicStatus,
                  status: "reserved",
                }),
                remarks: "Updated public entry due to payment creation",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }

          return newPayment;
        });
        return c.json(PaymentDTO.parse(created), 201);
      } else {
        // Return 400
        return c.json(
          { error: "Either bookingId or publicEntryId must be provided" },
          400
        );
      }
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

paymentRoutes.openapi(
  createRoute({
    tags: ["Payments"],
    summary: "Update Payment by ID",
    method: "patch",
    path: "/:id",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      body: {
        description: "Update Payment",
        required: true,
        content: {
          "application/json": { schema: UpdatePaymentDTO },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: PaymentDTO,
          },
        },
        description: "Payment Updated Successfully",
      },
      400: {
        description: "Invalid payment ID",
      },
      404: {
        description: "Payment not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(userId, "PAYMENT", "update");

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update payment.");
      }

      const paymentId = Number(c.req.param("id"));

      if (isNaN(paymentId)) {
        throw new BadRequestError("Invalid payment ID.");
      }

      const parsed = UpdatePaymentDTO.parse(await c.req.json());

      const verifiedBy = userId;
      const paymentStatus = parsed.paymentStatus;

      const payment = await db.query.PaymentsTable.findFirst({
        where: eq(PaymentsTable.paymentId, paymentId),
      });

      if (!payment) {
        throw new NotFoundError("Payment not found.");
      }

      const updatedPayment = await db.transaction(async (tx) => {
        if (paymentStatus === "valid" && payment.paymentStatus !== "valid") {
          // Process Status in Private Booking
          if (payment.publicEntryId == null) {
            if (payment.bookingId == null) {
              throw new NotFoundError("Booking not found");
            }

            const booking = await tx.query.BookingsTable.findFirst({
              where: eq(BookingsTable.bookingId, payment.bookingId),
            });

            if (!booking) {
              throw new NotFoundError("Booking not found.");
            }

            const amountPaid = booking.amountPaid + payment.netPaidAmount;
            const remainingBalance =
              booking.remainingBalance - payment.netPaidAmount;
            const bookingPaymentStatus =
              remainingBalance === 0 ? "paid" : "partially-paid";

            const customer = await db.query.UsersTable.findFirst({
              where: eq(UsersTable.userId, booking.userId),
            });

            const resend = new Resend(process.env.RESEND_API_KEY);
            const notifyResult = await resend.emails.send({
              from: "Danayas Resort <onboarding@resend.dev>",
              to: ["realrickyjones@gmail.com"], // Replace with Customer email
              subject: `Payment Recorded for Your Reservation at Danayas Resort`,
              replyTo: "Danayas@email.com", // Replace with Danayas email
              html: `
                        <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
                          <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                              <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
                              <p style="margin: 5px 0 0; color: #fdfaf6;">Payment Notification</p>
                            </div>
                            <div style="padding: 30px;">
                              <p style="font-size: 16px;">Hello ${customer?.firstName},</p>
                              <p style="font-size: 15px;">
                                This is to inform you that a payment has been added to your reservation by our staff.
                              </p>
                              <table style="width: 100%; margin-top: 20px; font-size: 14px;">
                                <tr>
                                  <td style="padding: 6px 0; font-weight: bold;">Payment Method:</td>
                                  <td style="padding: 6px 0;">${payment.paymentMethod}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 6px 0; font-weight: bold;">Amount Paid:</td>
                                  <td style="padding: 6px 0;">₱${payment.netPaidAmount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 6px 0; font-weight: bold;">Change Returned:</td>
                                  <td style="padding: 6px 0;">₱${payment.changeAmount.toFixed(2)}</td>
                                </tr>
                              </table>
                              <p style="margin-top: 20px; font-size: 14px;">Thank you for choosing Danayas Resort. Please keep this record for reference.</p>
                              <p style="margin-top: 30px; font-size: 13px; color: #999;">
                                Sent automatically by the website on ${new Date().toLocaleString()}.
                              </p>
                            </div>
                            <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                              <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
                              <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
                            </div>
                          </div>
                        </div>
                      `,
            });

            const updatedBooking = await tx
              .update(BookingsTable)
              .set({
                amountPaid: amountPaid,
                remainingBalance: remainingBalance,
                bookingPaymentStatus: bookingPaymentStatus,
                bookStatus: "reserved",
              })
              .where(eq(BookingsTable.bookingId, payment.bookingId))
              .returning()
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "BOOKINGS",
                recordId: payment.bookingId,
                data: JSON.stringify({
                  amountPaid: amountPaid,
                  remainingBalance: remainingBalance,
                  bookingPaymentStatus: bookingPaymentStatus,
                  bookStatus: "reserved",
                }),
                remarks: "Updated booking due to payment verification",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
          // Process Status in Public Entry
          if (payment.bookingId == null) {
            if (payment.publicEntryId == null) {
              throw new NotFoundError(" Public not found");
            }
            const publics = await tx.query.PublicEntryTable.findFirst({
              where: eq(PublicEntryTable.publicEntryId, payment.publicEntryId),
            });

            if (!publics) {
              throw new NotFoundError("Public Entry not found");
            }

            const amountPaid = publics.amountPaid + payment.netPaidAmount;
            const remainingBalance =
              publics.remainingBalance - payment.netPaidAmount;

            const publicPaymentStatus =
              remainingBalance === 0 ? "paid" : "partially-paid";

            const customer = await db.query.UsersTable.findFirst({
              where: eq(UsersTable.userId, publics.userId),
            });

            const resend = new Resend(process.env.RESEND_API_KEY);
            const notifyResult = await resend.emails.send({
              from: "Danayas Resort <onboarding@resend.dev>",
              to: ["realrickyjones@gmail.com"], // Replace with Customer email
              subject: `Payment Recorded for Your Reservation at Danayas Resort`,
              replyTo: "Danayas@email.com", // Replace with Danayas email
              html: `
                        <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
                          <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                              <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
                              <p style="margin: 5px 0 0; color: #fdfaf6;">Payment Notification</p>
                            </div>
                            <div style="padding: 30px;">
                              <p style="font-size: 16px;">Hello ${customer?.firstName},</p>
                              <p style="font-size: 15px;">
                                This is to inform you that a payment has been added to your reservation by our staff.
                              </p>
                              <table style="width: 100%; margin-top: 20px; font-size: 14px;">
                                <tr>
                                  <td style="padding: 6px 0; font-weight: bold;">Payment Method:</td>
                                  <td style="padding: 6px 0;">${payment.paymentMethod}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 6px 0; font-weight: bold;">Amount Paid:</td>
                                  <td style="padding: 6px 0;">₱${payment.netPaidAmount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 6px 0; font-weight: bold;">Change Returned:</td>
                                  <td style="padding: 6px 0;">₱${payment.changeAmount.toFixed(2)}</td>
                                </tr>
                              </table>
                              <p style="margin-top: 20px; font-size: 14px;">Thank you for choosing Danayas Resort. Please keep this record for reference.</p>
                              <p style="margin-top: 30px; font-size: 13px; color: #999;">
                                Sent automatically by the website on ${new Date().toLocaleString()}.
                              </p>
                            </div>
                            <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                              <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
                              <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
                            </div>
                          </div>
                        </div>
                      `,
            });

            const updatePublic = await tx
              .update(PublicEntryTable)
              .set({
                amountPaid: amountPaid,
                remainingBalance: remainingBalance,
                publicPaymentStatus: publicPaymentStatus,
                status: "reserved",
              })
              .where(eq(PublicEntryTable.publicEntryId, payment.publicEntryId))
              .returning()
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId: userId,
                action: "update",
                tableName: "PUBLIC_ENTRY",
                recordId: payment.publicEntryId,
                data: JSON.stringify({
                  amountPaid: amountPaid,
                  remainingBalance: remainingBalance,
                  publicPaymentStatus: publicPaymentStatus,
                  status: "reserved",
                }),
                remarks: "Updated public entry due to payment verification",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }
        }

        if (paymentStatus === "invalid") {
          //TODO: Request another payment for customer when invalid
          if (!parsed.remarks) {
            return c.json(
              {
                error: "Remarks are required when invalidating a payment",
              },
              400
            );
          }

          let customer;

          // Process Status in Private Booking
          if (payment.publicEntryId == null) {
            if (payment.bookingId == null) {
              throw new NotFoundError("Booking not found");
            }

            const booking = await tx.query.BookingsTable.findFirst({
              where: eq(BookingsTable.bookingId, payment.bookingId),
            });

            if (!booking) {
              throw new NotFoundError("Booking not found.");
            }
            customer = await db.query.UsersTable.findFirst({
              where: eq(UsersTable.userId, booking.userId),
            });
          }
          // Process Status in Public Entry
          if (payment.bookingId == null) {
            if (payment.publicEntryId == null) {
              throw new NotFoundError(" Public not found");
            }

            const publics = await tx.query.PublicEntryTable.findFirst({
              where: eq(PublicEntryTable.publicEntryId, payment.publicEntryId),
            });

            if (!publics) {
              throw new NotFoundError("Public Entry not found");
            }

            customer = await db.query.UsersTable.findFirst({
              where: eq(UsersTable.userId, publics.userId),
            });
          }

          const resend = new Resend(process.env.RESEND_API_KEY);
          const notifyResult = await resend.emails.send({
            from: "Danayas Resort <onboarding@resend.dev>",
            to: ["realrickyjones@gmail.com"], // Replace with Customer email
            subject: `Payment Invalid for Your Reservation at Danayas Resort`,
            replyTo: "Danayas@email.com", // Replace with Danayas email
            html: `
                     <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
                      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <div style="background: #b30000; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                          <h2 style="margin: 0; color: #fff;">Danayas Resort & Events Venue</h2>
                          <p style="margin: 5px 0 0; color: #fff;">Payment Rejected</p>
                        </div>
                        <div style="padding: 30px;">
                          <p style="font-size: 16px;">Dear ${customer?.firstName},</p>
                          <p style="font-size: 15px;">
                            Your recent payment has been <strong>marked invalid</strong> by our team.
                          </p>
                          <p><strong>Reason:</strong> ${parsed.remarks}</p>
                          <p style="margin-top: 20px; font-size: 14px;">Please contact us to resolve this issue or submit a new payment.</p>
                          <p style="margin-top: 30px; font-size: 13px; color: #999;">
                            Sent automatically by the website on ${new Date().toLocaleString()}.
                          </p>
                        </div>
                        <div style="background: #b30000; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                          <p style="margin: 0; font-size: 13px; color: #fff;">Danayas Resort & Events Venue</p>
                          <p style="margin: 0; font-size: 12px; color: #eee;">© ${new Date().getFullYear()} All rights reserved.</p>
                        </div>
                      </div>
                    </div>
                  `,
          });
        }

        if (paymentStatus === "voided") {
          // TODO: Bug => when there is payment and its voided the bookStatus and status(public) will be pending but paymentStatus => partially paid or paid
          if (!parsed.remarks) {
            return c.json(
              { error: "Remarks are required when voiding a payment" },
              400
            );
          }
          if (payment.paymentStatus === "valid") {
            if (payment.publicEntryId == null) {
              if (payment.bookingId == null) {
                throw new NotFoundError("Booking not Found");
              }
              const booking = await tx.query.BookingsTable.findFirst({
                where: eq(BookingsTable.bookingId, payment.bookingId),
              });

              if (!booking) {
                throw new NotFoundError("Booking not found.");
              }
              const amountPaid = booking.amountPaid - payment.netPaidAmount;
              const remainingBalance =
                booking.remainingBalance + payment.netPaidAmount;

              let bookingPaymentStatus: "paid" | "partially-paid" | "unpaid";

              if (amountPaid === 0) {
                bookingPaymentStatus = "unpaid";
              } else if (remainingBalance > 0) {
                bookingPaymentStatus = "partially-paid";
              } else {
                bookingPaymentStatus = "paid";
              }

              let bookStatus = booking.bookStatus;

              // Check if there are any other valid payments for this booking
              const otherValidPayments = await tx.query.PaymentsTable.findMany({
                where: and(
                  eq(PaymentsTable.bookingId, payment.bookingId),
                  eq(PaymentsTable.paymentStatus, "valid"),
                  ne(PaymentsTable.paymentId, paymentId)
                ),
              });

              if (
                otherValidPayments.length === 0 &&
                booking.bookStatus === "reserved"
              ) {
                bookStatus = "pending";
              }

              const resend = new Resend(process.env.RESEND_API_KEY);
              const notifyResult = await resend.emails.send({
                from: "Danayas Resort <onboarding@resend.dev>",
                to: ["realrickyjones@gmail.com"], // Replace with Customer email
                subject: `Payment Voided for Your Reservation at Danayas Resort`,
                replyTo: "Danayas@email.com", // Replace with Danayas email
                html: `
                     <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
                      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <div style="background: #9e7300; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                          <h2 style="margin: 0; color: #fff;">Danayas Resort & Events Venue</h2>
                          <p style="margin: 5px 0 0; color: #fff;">Payment Voided</p>
                        </div>
                        <div style="padding: 30px;">
                          <p style="font-size: 16px;">Hello ${booking.firstName},</p>
                          <p style="font-size: 15px;">
                            One of your previous payments has been <strong>voided</strong> by our team.
                          </p>
                          <p><strong>Remarks:</strong> ${parsed.remarks}</p>
                          <p style="margin-top: 20px; font-size: 14px;">You may resubmit a new payment or contact support for clarification.</p>
                          <p style="margin-top: 30px; font-size: 13px; color: #999;">
                            Sent automatically by the website on ${new Date().toLocaleString()}.
                          </p>
                        </div>
                        <div style="background: #9e7300; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                          <p style="margin: 0; font-size: 13px; color: #fff;">Danayas Resort & Events Venue</p>
                          <p style="margin: 0; font-size: 12px; color: #eee;">© ${new Date().getFullYear()} All rights reserved.</p>
                        </div>
                      </div>
                    </div>
                  `,
              });

              await tx
                .update(BookingsTable)
                .set({
                  amountPaid: amountPaid,
                  remainingBalance: remainingBalance,
                  bookingPaymentStatus: bookingPaymentStatus,
                  bookStatus: bookStatus,
                })
                .where(eq(BookingsTable.bookingId, payment.bookingId))
                .execute();

              await tx
                .insert(AuditLogsTable)
                .values({
                  userId: userId,
                  action: "update",
                  tableName: "BOOKINGS",
                  recordId: payment.bookingId,
                  data: JSON.stringify({
                    amountPaid: amountPaid,
                    remainingBalance: remainingBalance,
                    bookingPaymentStatus: bookingPaymentStatus,
                    bookStatus: bookStatus,
                  }),
                  remarks: "Updated booking due to payment voiding",
                  createdAt: new Date().toISOString(),
                })
                .execute();
            }

            if (payment.bookingId == null) {
              if (payment.publicEntryId == null) {
                throw new NotFoundError("Public entry not found");
              }

              const publics = await tx.query.PublicEntryTable.findFirst({
                where: eq(
                  PublicEntryTable.publicEntryId,
                  payment.publicEntryId
                ),
              });

              if (!publics) {
                throw new NotFoundError("Public entry not found");
              }

              const amountPaid = publics.amountPaid - payment.netPaidAmount;
              const remainingBalance =
                publics.remainingBalance + payment.netPaidAmount;

              let publicPaymentStatus: "paid" | "partially-paid" | "unpaid";
              if (amountPaid === 0) {
                publicPaymentStatus = "unpaid";
              } else if (remainingBalance > 0) {
                publicPaymentStatus = "partially-paid";
              } else {
                publicPaymentStatus = "paid";
              }

              let status = publics.status;

              const otherValidPayment = await tx.query.PaymentsTable.findMany({
                where: and(
                  eq(PaymentsTable.publicEntryId, payment.publicEntryId),
                  eq(PaymentsTable.paymentStatus, "valid"),
                  ne(PaymentsTable.paymentId, paymentId)
                ),
              });

              if (
                otherValidPayment.length === 0 &&
                publics.status === "reserved"
              ) {
                status = "pending";
              }

              const resend = new Resend(process.env.RESEND_API_KEY);
              const notifyResult = await resend.emails.send({
                from: "Danayas Resort <onboarding@resend.dev>",
                to: ["realrickyjones@gmail.com"], // Replace with Customer email
                subject: `Your Booking Confirmation at Danayas Resort & Events Venue`,
                replyTo: "Danayas@email.com", // Replace with Danayas email
                html: `
                     <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
                      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <div style="background: #9e7300; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                          <h2 style="margin: 0; color: #fff;">Danayas Resort & Events Venue</h2>
                          <p style="margin: 5px 0 0; color: #fff;">Payment Voided</p>
                        </div>
                        <div style="padding: 30px;">
                          <p style="font-size: 16px;">Hello ${publics.firstName},</p>
                          <p style="font-size: 15px;">
                            One of your previous payments has been <strong>voided</strong> by our team.
                          </p>
                          <p><strong>Remarks:</strong> ${parsed.remarks}</p>
                          <p style="margin-top: 20px; font-size: 14px;">You may resubmit a new payment or contact support for clarification.</p>
                          <p style="margin-top: 30px; font-size: 13px; color: #999;">
                            Sent automatically by the website on ${new Date().toLocaleString()}.
                          </p>
                        </div>
                        <div style="background: #9e7300; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                          <p style="margin: 0; font-size: 13px; color: #fff;">Danayas Resort & Events Venue</p>
                          <p style="margin: 0; font-size: 12px; color: #eee;">© ${new Date().getFullYear()} All rights reserved.</p>
                        </div>
                      </div>
                    </div>
                  `,
              });

              await tx
                .update(PublicEntryTable)
                .set({
                  amountPaid: amountPaid,
                  remainingBalance: remainingBalance,
                  publicPaymentStatus: publicPaymentStatus,
                  status: status,
                })
                .where(
                  eq(PublicEntryTable.publicEntryId, payment.publicEntryId)
                )
                .execute();

              await tx
                .insert(AuditLogsTable)
                .values({
                  userId: userId,
                  action: "update",
                  tableName: "PUBLIC_ENTRY",
                  recordId: payment.publicEntryId,
                  data: JSON.stringify({
                    amountPaid: amountPaid,
                    remainingBalance: remainingBalance,
                    publicPaymentStatus: publicPaymentStatus,
                    status: status,
                  }),
                  remarks: "Updated public entry due to payment voiding",
                  createdAt: new Date().toISOString(),
                })
                .execute();
            }
          }
        }

        const result = (
          await tx
            .update(PaymentsTable)
            .set({ ...parsed, verifiedBy, paymentStatus })
            .where(eq(PaymentsTable.paymentId, paymentId))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId: userId,
            action: "update",
            tableName: "PAYMENTS",
            recordId: result.paymentId,
            data: JSON.stringify(result),
            remarks: `Payment ${paymentStatus} by user ${userId}`,
            createdAt: new Date().toISOString(),
          })
          .execute();

        if (!result) {
          throw new NotFoundError("Payment not found.");
        }

        return result;
      });

      return c.json(updatedPayment);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

paymentRoutes.openapi(
  createRoute({
    tags: ["Payments"],
    summary: "Override Tendered Amount (Admin PIN Required)",
    method: "patch",
    path: "/:id/override-tendered",
    request: {
      headers: z.object({
        Authorization: z.string(),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              tenderedAmount: z.number().positive(),
              remarks: z.string().min(1),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Tendered amount overridden",
      },
      403: {
        description: "Forbidden",
      },
      404: {
        description: "Payment not found",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PAYMENT",
        "overrideAmount"
      );

      if (!hasPermission) {
        throw new ForbiddenError(`Not authorized to override tendered amount.`);
      }

      const paymentId = Number(c.req.param("id"));
      if (isNaN(paymentId)) {
        throw new BadRequestError("Invalid payment ID");
      }

      const { tenderedAmount, remarks } = await c.req.valid("json");

      const payment = await db.query.PaymentsTable.findFirst({
        where: eq(PaymentsTable.paymentId, paymentId),
      });
      if (!payment) {
        throw new NotFoundError("Payment not found.");
      }
      if (payment.paymentStatus !== "pending") {
        return c.json(
          {
            error:
              "Only pending payments can have their tendered amount overridden.",
          },
          400
        );
      }

      let contextData = null;

      if (payment.bookingId !== null) {
        contextData = await db.query.BookingsTable.findFirst({
          where: eq(BookingsTable.bookingId, payment.bookingId),
        });
      } else if (payment.publicEntryId !== null) {
        contextData = await db.query.PublicEntryTable.findFirst({
          where: eq(PublicEntryTable.publicEntryId, payment.publicEntryId),
        });
      }

      if (!contextData) {
        throw new NotFoundError(
          "Associated booking or public entry not found."
        );
      }

      const updated = await db.transaction(async (tx) => {
        const updatedPayment = (
          await tx
            .update(PaymentsTable)
            .set({
              tenderedAmount: tenderedAmount,
              remarks: remarks,
              netPaidAmount: tenderedAmount,
              paymentStatus: "valid",
            })
            .where(eq(PaymentsTable.paymentId, paymentId))
            .returning()
            .execute()
        )[0];

        await tx
          .insert(AuditLogsTable)
          .values({
            userId,
            action: "update",
            tableName: "PAYMENTS",
            recordId: paymentId,
            data: JSON.stringify({ tenderedAmount }),
            remarks: `Tendered amount overridden: ${remarks}`,
            createdAt: new Date().toISOString(),
          })
          .execute();

        if (payment.publicEntryId == null) {
          if (payment.bookingId == null) {
            throw new NotFoundError("Booking not found");
          }

          const booking = await tx.query.BookingsTable.findFirst({
            where: eq(BookingsTable.bookingId, payment.bookingId),
          });

          if (!booking) {
            throw new NotFoundError("Booking not found.");
          }

          const amountPaid = booking.amountPaid + tenderedAmount;
          const remainingBalance = booking.remainingBalance - tenderedAmount;
          const bookingPaymentStatus =
            Math.max(remainingBalance, 0) === 0 ? "paid" : "partially-paid";

          const isLowAmountRefund =
            tenderedAmount < 2000 &&
            booking.amountPaid === 0 &&
            booking.paymentTerms === "installment";

          if (isLowAmountRefund) {
            const refund = await tx
              .insert(RefundsTable)
              .values({
                bookingId: booking.bookingId,
                publicEntryId: null,
                refundAmount: tenderedAmount,
                refundStatus: "pending",
                refundReason: "Net paid amount below ₱2000",
                refundType: "low-amount",
                verifiedBy: userId,
                refundMethod: "gcash",
                remarks: "Auto refund for low amount",
                createdAt: new Date().toISOString(),
              })
              .returning()
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId,
                action: "create",
                tableName: "REFUND",
                recordId: refund[0].refundId,
                data: JSON.stringify(refund[0]),
                remarks: "Auto refund (netPaidAmount < ₱2000)",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }

          if (tenderedAmount > booking.remainingBalance && !isLowAmountRefund) {
            const excess = tenderedAmount - booking.remainingBalance;
            const refund = await tx
              .insert(RefundsTable)
              .values({
                bookingId: booking.bookingId,
                publicEntryId: null,
                refundAmount: excess,
                refundStatus: "pending",
                refundReason: "Excess netPaidAmount",
                refundType: "overpayment",
                verifiedBy: userId,
                refundMethod: "gcash",
                remarks: "Auto refund for overpayment",
                createdAt: new Date().toISOString(),
              })
              .returning()
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId,
                action: "create",
                tableName: "REFUND",
                recordId: refund[0].refundId,
                data: JSON.stringify(refund[0]),
                remarks: "Refund due to overpayment",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }

          await tx
            .update(BookingsTable)
            .set({
              amountPaid: amountPaid,
              remainingBalance: Math.max(remainingBalance, 0),
              bookingPaymentStatus: bookingPaymentStatus,
              bookStatus: isLowAmountRefund ? "pending" : "reserved",
            })
            .where(eq(BookingsTable.bookingId, payment.bookingId))
            .execute();

          await tx
            .insert(AuditLogsTable)
            .values({
              userId,
              action: "update",
              tableName: "BOOKINGS",
              recordId: payment.bookingId,
              data: JSON.stringify({
                amountPaid: amountPaid,
                remainingBalance: Math.max(remainingBalance, 0),
                bookingPaymentStatus: bookingPaymentStatus,
                bookStatus: isLowAmountRefund ? "pending" : "reserved",
              }),
              remarks: "Updated booking due to payment verification",
              createdAt: new Date().toISOString(),
            })
            .execute();
        }

        if (payment.bookingId == null) {
          if (payment.publicEntryId == null) {
            throw new NotFoundError("Public not found");
          }

          const publics = await tx.query.PublicEntryTable.findFirst({
            where: eq(PublicEntryTable.publicEntryId, payment.publicEntryId),
          });

          if (!publics) {
            throw new NotFoundError("Public Entry not found");
          }

          const amountPaid = publics.amountPaid + tenderedAmount;
          const remainingBalance = publics.remainingBalance - tenderedAmount;

          const publicPaymentStatus =
            Math.max(remainingBalance, 0) === 0 ? "paid" : "partially-paid";

          const isLowAmountRefund =
            tenderedAmount < 2000 &&
            publics.amountPaid === 0 &&
            publics.paymentTerms === "installment";

          if (isLowAmountRefund) {
            const refund = await tx
              .insert(RefundsTable)
              .values({
                bookingId: null,
                publicEntryId: publics.publicEntryId,
                refundAmount: tenderedAmount,
                refundStatus: "pending",
                refundReason: "Net paid amount below ₱2000",
                refundType: "low-amount",
                refundMethod: "gcash",
                remarks: "Auto refund for low amount",
                createdAt: new Date().toISOString(),
              })
              .returning()
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId,
                action: "create",
                tableName: "REFUND",
                recordId: refund[0].refundId,
                data: JSON.stringify(refund[0]),
                remarks: "Auto refund (netPaidAmount < ₱2000)",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }

          if (tenderedAmount > publics.remainingBalance && !isLowAmountRefund) {
            const excess = tenderedAmount - publics.remainingBalance;
            const refund = await tx
              .insert(RefundsTable)
              .values({
                bookingId: null,
                publicEntryId: publics.publicEntryId,
                refundAmount: excess,
                refundStatus: "pending",
                refundReason: "Excess netPaidAmount",
                refundType: "overpayment",
                refundMethod: "gcash",
                remarks: "Auto refund for overpayment",
                createdAt: new Date().toISOString(),
              })
              .returning()
              .execute();

            await tx
              .insert(AuditLogsTable)
              .values({
                userId,
                action: "create",
                tableName: "REFUND",
                recordId: refund[0].refundId,
                data: JSON.stringify(refund[0]),
                remarks: "Refund due to overpayment",
                createdAt: new Date().toISOString(),
              })
              .execute();
          }

          await tx
            .update(PublicEntryTable)
            .set({
              amountPaid: amountPaid,
              remainingBalance: Math.max(remainingBalance, 0),
              publicPaymentStatus: publicPaymentStatus,
              status: isLowAmountRefund ? "pending" : "reserved",
            })
            .where(eq(PublicEntryTable.publicEntryId, publics.publicEntryId))
            .execute();

          await tx
            .insert(AuditLogsTable)
            .values({
              userId,
              action: "update",
              tableName: "PUBLIC_ENTRY",
              recordId: payment.publicEntryId,
              data: JSON.stringify({
                amountPaid: amountPaid,
                remainingBalance: Math.max(remainingBalance, 0),
                publicPaymentStatus: publicPaymentStatus,
                status: isLowAmountRefund ? "pending" : "reserved",
              }),
              remarks: "Updated public entry due to payment verification",
              createdAt: new Date().toISOString(),
            })
            .execute();
        }

        const user = await tx.query.UsersTable.findFirst({
          where: eq(UsersTable.userId, userId),
        });

        if (user?.role !== "admin") {
          await revokePermission(userId, "PAYMENT", "overrideAmount");

          await tx
            .insert(AuditLogsTable)
            .values({
              userId,
              action: "delete",
              tableName: "PERMISSION",
              recordId: userId,
              data: JSON.stringify({
                table: "PAYMENT",
                action: "overrideAmount",
              }),
              remarks: "Auto-revoked override permission",
              createdAt: new Date().toISOString(),
            })
            .execute();
        }

        return updatedPayment;
      });

      return c.json(updated, 200);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default paymentRoutes;
