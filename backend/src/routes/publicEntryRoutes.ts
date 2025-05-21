import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { PublicEntryTable } from "../schemas/PublicEntry";
import {
  PublicEntryDTO,
  CreatePublicEntryDTO,
  UpdatePublicEntryDTO,
} from "../dto/publicEntryDTO";
import { and, eq, sql } from "drizzle-orm";
import { processBookingData } from "../utils/dateHelpers";
import { UsersTable } from "../schemas/User";
import { DiscountsTable } from "../schemas/Discounts";
import { PaymentsTable } from "../schemas/Payment";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { dateConflicts } from "../utils/dateConflict";
import { getActiveRateId } from "../utils/activeRate";
import { errorHandler } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";
import { PublicEntryRateTable } from "../schemas/PublicEntryRate.ts";
import { RefundsTable } from "../schemas/Refund";
import { RefundPaymentsTable } from "../schemas/RefundPayment";

const publicEntryRoutes = new OpenAPIHono<AuthContext>();

publicEntryRoutes.use("/*", authMiddleware);

publicEntryRoutes.openapi(
  createRoute({
    tags: ["Public Entry"],
    summary: "Get all public entries",
    method: "get",
    path: "/",
    request: {
      query: z.object({
        limit: z.coerce.number().nonnegative().openapi({
          example: 50,
          description: "Limit that the server will give",
        }),
        page: z.coerce.number().nonnegative().openapi({
          example: 1,
          description: "Page to get",
        }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: PublicEntryDTO.array(),
          },
        },
        description: "Retrieve all public entries",
      },
      400: {
        description: "Invalid request",
      },
      404: {
        description: "No public entry found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PUBLIC_ENTRY",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get public.");
      }

      const { limit, page } = c.req.valid("query");

      if (limit < 1 || page < 1) {
        throw new BadRequestError("Limit and page must be greater than 0.");
      }

      const publics = await db.query.PublicEntryTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const parsedPublics = publics.map((entry) => ({
        ...entry,
        adultGuestNames: entry.adultGuestNames
          ? JSON.parse(entry.adultGuestNames)
          : [],
        kidGuestNames: entry.kidGuestNames
          ? JSON.parse(entry.kidGuestNames)
          : [],
      }));

      return c.json({
        total: parsedPublics.length,
        items: parsedPublics,
      });
    } catch (e) {
      return errorHandler(e, c);
    }
  }
);

publicEntryRoutes.openapi(
  createRoute({
    tags: ["Public Entry"],
    summary: "Retrieve Public Entry by ID",
    method: "get",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce.number().openapi({ description: "Public Entry ID" }),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: PublicEntryDTO,
          },
        },
        description: "Retrieve the public entry by ID",
      },
      400: {
        description: "Public Entry not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),

  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PUBLIC_ENTRY",
        "read"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to get public.");
      }

      const { id } = c.req.valid("param");
      const publics = await db.query.PublicEntryTable.findFirst({
        where: eq(PublicEntryTable.publicEntryId, id),
      });

      if (!publics) {
        throw new NotFoundError("Booking not found.");
      }

      // Parse JSON strings to arrays if not null
      const parsedPublics = {
        ...publics,
        adultGuestNames: publics.adultGuestNames
          ? JSON.parse(publics.adultGuestNames)
          : [],
        kidGuestNames: publics.kidGuestNames
          ? JSON.parse(publics.kidGuestNames)
          : [],
      };

      return c.json(PublicEntryDTO.parse(parsedPublics));
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

publicEntryRoutes.openapi(
  createRoute({
    tags: ["Public Entry"],
    summary: "Create Public Entry",
    method: "post",
    path: "/",
    request: {
      body: {
        description: "Public Entry credentials",
        required: true,
        content: {
          "application/json": {
            schema: CreatePublicEntryDTO,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: CreatePublicEntryDTO,
          },
        },
        description: "Public Entry created successfully",
      },
      400: {
        description: "Invalid public entry data",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PUBLIC_ENTRY",
        "create"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to create public.");
      }

      const body = c.req.valid("json");
      const reservationType = body.reservationType || "online";

      let userDetails = null;
      let createdByUser = null;

      if (reservationType === "online") {
        if (!body.userId) {
          throw new BadRequestError(
            "Online reservations require a user account."
          );
        }

        userDetails = await db
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.userId, body.userId))
          .then((rows) => rows[0]);

        if (!userDetails) {
          throw new BadRequestError("User not found.");
        }

        if (!["admin", "staff", "customer"].includes(userDetails.role)) {
          throw new BadRequestError(
            "Only admin, staff, or customer roles can make online reservations."
          );
        }
      }

      if (reservationType === "walk-in") {
        if (!body.userId) {
          throw new BadRequestError(
            "Walk-in public must be created by staff or admin."
          );
        }

        createdByUser = await db
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.userId, body.userId))
          .then((rows) => rows[0]);

        if (!createdByUser) {
          throw new BadRequestError("Creator user not found.");
        }

        if (!["admin", "staff"].includes(createdByUser.role)) {
          throw new BadRequestError(
            "Only admin or staff roles can create walk-in public."
          );
        }
      }

      const { numAdults, numKids, discountId, mode } = body;

      let discountPercent = 0;

      if (discountId) {
        const discount = await db.query.DiscountsTable.findFirst({
          where: eq(DiscountsTable.discountId, discountId),
        });
        if (!discount) {
          throw new BadRequestError("Invalid discount ID");
        }

        discountPercent = discount.percentage ?? 0;
      }

      const adultRateId = await getActiveRateId("adult", mode);
      const kidRateId = await getActiveRateId("kid", mode);

      const adultRate = await db.query.PublicEntryRateTable.findFirst({
        where: eq(PublicEntryRateTable.rateId, adultRateId),
      });
      const kidRate = await db.query.PublicEntryRateTable.findFirst({
        where: and(eq(PublicEntryRateTable.rateId, kidRateId)),
      });

      const totalRate =
        numAdults * (adultRate?.rate ?? 0) + numKids * (kidRate?.rate ?? 0);

      const totalAmount = totalRate - totalRate * (discountPercent / 100);

      const updatedBody = {
        ...processBookingData(body),
        totalAmount,
        userId: body.userId,
        adultRateId,
        kidRateId,
        firstName: body.firstName || userDetails?.firstName || null,
        lastName: body.lastName || userDetails?.lastName || null,
        contactNo: body.contactNo || userDetails?.contactNo || null,
        address: body.address || userDetails?.address || null,
        adultGuestNames: JSON.stringify(body.adultGuestNames),
        kidGuestNames: JSON.stringify(body.kidGuestNames),
        amountPaid: 0,
        remainingBalance: totalAmount,
      };

      // Map mode values to match accepted types in dateConflicts
      // const mappedMode =
      //   body.mode === "day-time"
      //     ? "day"
      //     : body.mode === "night-time"
      //     ? "night"
      //     : body.mode;

      // await dateConflicts({
      //   date: updatedBody.entryDate,
      //   mode: mappedMode,
      // });

      const dbPublic = (
        await db
          .insert(PublicEntryTable)
          .values(updatedBody)
          .returning()
          .execute()
      )[0];

      return c.json({ ...dbPublic }, 201);
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

publicEntryRoutes.openapi(
  createRoute({
    tags: ["Public Entry"],
    summary: "Update Public Entry",
    method: "patch",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce.number().openapi({ description: "Public Entry ID" }),
      }),
      body: {
        description: "Updated Public Entry data",
        required: true,
        content: {
          "application/json": {
            schema: UpdatePublicEntryDTO,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: UpdatePublicEntryDTO,
          },
        },
        description: "Public Entry updated successfully",
      },
      400: {
        description: "Invalid data",
      },
      404: {
        description: "Public Entry not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PUBLIC_ENTRY",
        "update"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update public.");
      }

      const publicEntryId = Number(c.req.param("id"));
      const body = c.req.valid("json");

      if (isNaN(publicEntryId)) {
        throw new BadRequestError("Invalid public entry id");
      }

      const res = UpdatePublicEntryDTO.parse(await c.req.json());
      const publics = await db.query.PublicEntryTable.findFirst({
        where: eq(PublicEntryTable.publicEntryId, publicEntryId),
      });

      if (!publics) {
        throw new NotFoundError("Public entry not found");
      }

      const processedData = processBookingData(res);

      // const conflict = await db.query.PublicEntryTable.findFirst({
      //   where: sql`publicEntryId != ${publicEntryId} AND status NOT IN ('cancelled', 'completed') AND date(entryDate) = date(${processedData.entryDate}))`,
      // });

      // if (conflict) {
      //   throw new BadRequestError(
      //     `This date is already booked for ${res.mode}. Please choose a different date or time mode.`
      //   );
      // }

      // Map mode values to match accepted types in dateConflicts
      // const mappedMode =
      //   res.mode === "day-time"
      //     ? "day"
      //     : res.mode === "night-time"
      //     ? "night"
      //     : res.mode;

      // if (!mappedMode) {
      //   throw new BadRequestError("Mode is required and must be valid.");
      // }

      // await dateConflicts({
      //   date: processedData.entryDate,
      //   mode: mappedMode,
      //   publicEntryId: publicEntryId.toString(),
      //   bookingId: undefined, // this is a Booking, so no booking ID
      // });

      const updatedPublic = await db
        .update(PublicEntryTable)
        .set({ ...processedData, status: "rescheduled" })
        .where(eq(PublicEntryTable.publicEntryId, publicEntryId))
        .returning()
        .execute();

      return c.json({
        status: "success",
        message: "Public updated successfully.",
        updatedPublic: updatedPublic[0],
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);
publicEntryRoutes.openapi(
  createRoute({
    tags: ["Public Entry"],
    summary: "Update Public Status by ID",
    method: "patch",
    path: "/:id/status",
    request: {
      body: {
        description: "Update Public Status",
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              status: z.enum([
                "pending",
                "reserved",
                "cancelled",
                "completed",
                "rescheduled",
                "pending-cancellation",
              ]),
              cancelCategory: z.enum(["natural-disaster", "others"]).optional(),
              cancelReason: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: PublicEntryDTO.pick({ status: true }),
          },
        },
        description: "Public Status Updated",
      },
      400: {
        description: "Invalid Public ID or status",
      },
      404: {
        description: "Public Not Found",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PUBLIC_ENTRY",
        "update"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to update public status.");
      }

      const publicEntryId = Number(c.req.param("id"));
      const { status, cancelCategory, cancelReason } = await c.req.json();

      const existingBooking = await db
        .select()
        .from(PublicEntryTable)
        .where(eq(PublicEntryTable.publicEntryId, publicEntryId))
        .execute();

      if (!existingBooking || existingBooking.length === 0) {
        throw new NotFoundError("Booking not found");
      }

      if (status === "cancelled") {
        if (!cancelCategory) {
          throw new BadRequestError(
            "Cancel category is required for cancellation"
          );
        }

        if (
          cancelCategory === "others" &&
          (!cancelReason || cancelReason.trim() === "")
        ) {
          throw new BadRequestError(
            "Cancel Reason is required for 'others' category"
          );
        }
        // If natural disaster, process refund
        if (cancelCategory === "natural-disaster") {
          // Check all existing payments for the public thats valid
          const allValidPayments = await db.query.PaymentsTable.findMany({
            where: and(
              eq(PaymentsTable.publicEntryId, publicEntryId),
              eq(PaymentsTable.paymentStatus, "valid")
            ),
          });

          if (allValidPayments.length === 0) {
            throw new BadRequestError(
              "No valid payments found for the public."
            );
          }

          const totalPaid = allValidPayments.reduce((sum, payment) => {
            return sum + payment.netPaidAmount;
          }, 0);
          await db.transaction(async (tx) => {
            const refund = (
              await tx
                .insert(RefundsTable)
                .values({
                  publicEntryId: publicEntryId,
                  bookingId: null,
                  refundAmount: totalPaid * 0.5,
                  refundStatus: "pending",
                  refundReason: "Booking Cancelled due to " + cancelCategory,
                })
                .returning()
                .execute()
            )[0];

            await Promise.all(
              allValidPayments.map((payment) =>
                tx
                  .insert(RefundPaymentsTable)
                  .values({
                    refundId: refund.refundId,
                    paymentId: payment.paymentId,
                    amountRefunded: payment.netPaidAmount * 0.5,
                  })
                  .returning()
                  .execute()
              )
            );
          });
        }
      }

      const updatedBooking = await db
        .update(PublicEntryTable)
        .set({
          status,
          cancelCategory: status === "cancelled" ? cancelCategory : null,
          cancelReason: status === "cancelled" ? cancelReason ?? null : null,
        })
        .where(eq(PublicEntryTable.publicEntryId, publicEntryId))
        .returning()
        .execute();

      return c.json(
        {
          message: "Public status updated",
          status: updatedBooking[0].status,
        },
        200
      );
    } catch (error) {
      return errorHandler(error, c);
    }
  }
);

publicEntryRoutes.openapi(
  createRoute({
    tags: ["Public Entry"],
    summary: "Delete Public Entry",
    method: "delete",
    path: "/:id",
    request: {
      params: z.object({
        id: z.coerce.number().openapi({ description: "Public Entry ID" }),
      }),
    },
    responses: {
      200: {
        description: "Public Entry deleted successfully",
      },
      404: {
        description: "Public Entry not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const hasPermission = await verifyPermission(
        userId,
        "PUBLIC_ENTRY",
        "delete"
      );

      if (!hasPermission) {
        throw new ForbiddenError("No permission to delete public.");
      }

      const { id } = c.req.valid("param");

      const entry = await db.query.PublicEntryTable.findFirst({
        where: eq(PublicEntryTable.publicEntryId, id),
      });

      if (!entry) {
        throw new NotFoundError("Public entry not found.");
      }

      // Delete the public entry record
      await db
        .delete(PublicEntryTable)
        .where(eq(PublicEntryTable.publicEntryId, id));

      return c.json({ message: "Public Entry deleted successfully" });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default publicEntryRoutes;

// DON'T DELETE: (LOGIC FOR UPDATING NO. OF GUEST)
/* 

      if (adultRateId === undefined) {
        throw new BadRequestError("adultRateId is required.");
      }
      if (kidRateId === undefined) {
        throw new BadRequestError("kidRateId is required.");
      }

      const adultRate = await db.query.PublicEntryRateTable.findFirst({
        where: and(
          eq(PublicEntryRateTable.rateId, adultRateId),
          eq(PublicEntryRateTable.category, "adult")
        ),
      });
      const kidRate = await db.query.PublicEntryRateTable.findFirst({
        where: and(
          eq(PublicEntryRateTable.rateId, kidRateId),
          eq(PublicEntryRateTable.category, "kid")
        ),
      });

      const totalAmount =
        (numAdults ?? 0) * (adultRate?.rate ?? 0) +
        (numKids ?? 0) * (kidRate?.rate ?? 0);
      const paymentStatus = publics.publicPaymentStatus;
      const remainingBalance = publics.remainingBalance;

      if (paymentStatus === "unpaid") {
        const updatedEntry = {
          ...body,
          totalAmount,
          status: body.status,
          publicPaymentStatus: paymentStatus,
          reservationType:
            body.reservationType === null ? undefined : body.reservationType,
          adultGuestNames: body.adultGuestNames
            ? JSON.stringify(body.adultGuestNames)
            : undefined,
          kidGuestNames: body.kidGuestNames
            ? JSON.stringify(body.kidGuestNames)
            : undefined,
          amountPaid: 0,
          remainingBalance: totalAmount,
        };

        const dbPublic = (
          await db
            .update(PublicEntryTable)
            .set(updatedEntry)
            .where(eq(PublicEntryTable.publicEntryId, publicEntryId))
            .returning()
            .execute()
        )[0];

        if (!dbPublic) {
          throw new NotFoundError("Not found");
        }

        return c.json(dbPublic);
      } else if (paymentStatus === "partially-paid") {
        const updatedEntry = {
          ...body,
          totalAmount,
          status: body.status,
          publicPaymentStatus: paymentStatus,
          reservationType:
            body.reservationType === null ? undefined : body.reservationType,
          adultGuestNames: body.adultGuestNames
            ? JSON.stringify(body.adultGuestNames)
            : undefined,
          kidGuestNames: body.kidGuestNames
            ? JSON.stringify(body.kidGuestNames)
            : undefined,
          amountPaid: body.amountPaid,

          remainingBalance: totalAmount,
        };

        const dbPublic = (
          await db
            .update(PublicEntryTable)
            .set(updatedEntry)
            .where(eq(PublicEntryTable.publicEntryId, publicEntryId))
            .returning()
            .execute()
        )[0];

        if (!dbPublic) {
          throw new NotFoundError("Not found");
        }

        return c.json(dbPublic);
      } else if (paymentStatus === "paid") {
        if (totalAmount > remainingBalance) {
          const updatedEntry = {
            ...body,
            totalAmount,
            status: body.status,
            publicPaymentStatus: paymentStatus as "partially-paid",
            reservationType:
              body.reservationType === null ? undefined : body.reservationType,
            adultGuestNames: body.adultGuestNames
              ? JSON.stringify(body.adultGuestNames)
              : undefined,
            kidGuestNames: body.kidGuestNames
              ? JSON.stringify(body.kidGuestNames)
              : undefined,
            amountPaid: body.amountPaid,
            remainingBalance: totalAmount,
          };

          const dbPublic = (
            await db
              .update(PublicEntryTable)
              .set(updatedEntry)
              .where(eq(PublicEntryTable.publicEntryId, publicEntryId))
              .returning()
              .execute()
          )[0];

          if (!dbPublic) {
            throw new NotFoundError("Not found");
          }

          return c.json(dbPublic);
        } else {
          const updatedEntry = {
            ...body,
            totalAmount,
            status: body.status,
            publicPaymentStatus: paymentStatus,
            reservationType:
              body.reservationType === null ? undefined : body.reservationType,
            adultGuestNames: body.adultGuestNames
              ? JSON.stringify(body.adultGuestNames)
              : undefined,
            kidGuestNames: body.kidGuestNames
              ? JSON.stringify(body.kidGuestNames)
              : undefined,
            amountPaid: body.amountPaid,
            remainingBalance: totalAmount,
          };

          const dbPublic = (
            await db
              .update(PublicEntryTable)
              .set(updatedEntry)
              .where(eq(PublicEntryTable.publicEntryId, publicEntryId))
              .returning()
              .execute()
          )[0];

          if (!dbPublic) {
            throw new NotFoundError("Not found");
          }

          return c.json(dbPublic);
        }
      } else {
        return c.json({ error: "No payment status" }, 400);
      } */
