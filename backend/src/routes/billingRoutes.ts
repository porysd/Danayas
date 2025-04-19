import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { BillingsTable } from "../schemas/Billing";
import { BillingDTO, CreateBillingDTO } from "../dto/billingDTO";
import { eq } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";
import { PaymentsTable, BookingsTable, PackagesTable } from "../schemas/schema";

export default new OpenAPIHono()
    .openapi(
        createRoute({
          tags: ["Billings"],
          summary: "Get all billings",
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
                  schema: BillingDTO.array(),
                },
              },
              description: "Retrieve all billings",
            },
            400: {
              description: "Invalid request",
            },
            404: {
              description: "Billings not found",
            },
            500: {
              description: "Internal server error",
            },
          },
        }),
        async (c) => {
          try {
            const { limit, page } = c.req.valid("query");
    
            if (limit < 1 || page < 1) {
              throw new BadRequestError("Limit and page must be greater than 0.");
            }
    
            const billings = await db.query.BillingsTable.findMany({
              limit,
              offset: (page - 1) * limit,
            });
    
            const allBillings = billings.map((Billing) => {
              try {
                return BillingDTO.parse(Billing);
              } catch (err) {
                throw new BadRequestError("Invalid Billing data.");
              }
            });
    
            return c.json({
              total: billings.length,
              items: allBillings,
            });
          } catch (err) {
            return errorHandler(err, c);
          }
        }
      )
      .openapi(
          createRoute({
            tags: ["Billings"],
            summary: "Get Billing by ID",
            method: "get",
            path: "/:id",
            request: {
              params: z.object({
                id: z.coerce
                  .number()
                  .int()
                  .openapi({ description: "Billing ID" }),
              }),
            },
            responses: {
              200: {
                content: {
                  "application/json": {
                    schema: BillingDTO,
                  },
                },
                description: "Billing found",
              },
              404: {
                description: "Billing not found",
              },
              500: {
                description: "Internal server error",
              },
            },
          }),
          async (c) => {
            try {
              const { id } = c.req.valid("param");
              const billing = await db.query.BillingsTable.findFirst({
                where: eq(BillingsTable.billingId, id),
              });
      
              if (!billing) {
                throw new NotFoundError("Billing not found.");
              }
      
              return c.json(BillingDTO.parse(billing));
            } catch (err) {
              return errorHandler(err, c);
            }
          }
        )
        .openapi(
            createRoute({
              tags: ["Billings"],
              summary: "Create Billing",
              method: "post",
              path: "/",
              request: {
                body: {
                  description: "Create Billing",
                  required: true,
                  content: {
                    "application/json": {
                      schema: CreateBillingDTO,
                    },
                  },
                },
              },
              responses: {
                201: {
                  description: "Billing created",
                  content: {
                    "application/json": {
                      schema: BillingDTO,
                    },
                  },
                },
                400: {
                  description: "Invalid Billing data",
                },
                500: {
                  description: "Internal server error",
                },
              },
            }),
            async (c) => {
              try {
                const parsed = CreateBillingDTO.parse(await c.req.json());
                const { paymentId } = parsed;

                const selectedPayment = await db
                    .select()
                    .from(PaymentsTable)
                    .where(eq(PaymentsTable.paymentId, paymentId))
                    .then((rows) => rows[0]);

                // Selects booking based on paymentId
                const selectedBooking = await db
                    .select()
                    .from(BookingsTable)
                    .where(eq(BookingsTable.bookingId, selectedPayment.bookingId))
                    .then((rows) => rows[0]);
                // Selects package based on BookingId
                const selectedPackage = await db
                    .select()
                    .from(PackagesTable)
                    .where(eq(PackagesTable.packageId, selectedBooking.packageId))
                    .then((rows) => rows[0]);
                
                const created = (
                  await db
                    .insert(BillingsTable)
                    .values({
                        ...parsed,
                        checkInDate: selectedBooking.checkInDate,
                        checkOutDate: selectedBooking.checkOutDate,
                        mode: selectedBooking.mode,
                        arrivalTime: selectedBooking.arrivalTime,
                        catering: selectedBooking.catering,
                        firstName: selectedBooking.firstName,
                        lastName: selectedBooking.lastName,
                        contactNo: selectedBooking.contactNo,
                        emailAddress: selectedBooking.emailAddress,
                        address: selectedBooking.address,
                        inclusion: selectedPackage.inclusion,
                        price: selectedPackage.price,
                        paymentTerms: selectedBooking.paymentTerms,
                        totalAmount: selectedBooking.totalAmount,
                        reference: selectedPayment.reference,
                        imageUrl: selectedPayment.imageUrl,
                    })
                    .returning()
                    .execute()
                )[0];
        
                return c.json(BillingDTO.parse(created), 201);
              } catch (err) {
                return errorHandler(err, c);
              }
            }
          )