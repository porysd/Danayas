// import { type Context } from 'hono';
// import db from '../config/database.ts';
// import { Payment, Billing } from '../schemas/schema.ts';
// import { eq, sum } from 'drizzle-orm';

// // NOTE: NO ZOD and Middleware

// // FUTURE MEDYO MADUGO TO

// export async function createPayment(c: Context) {
//     try {
//         const paymentData = await c.req.json();

//         // Insert new payment
//         const insertedPayment = await db.insert(Payment).values({
//             bookingId: paymentData.bookingId,
//             discountAmount: paymentData.discountAmount || 0,
//             downpaymentAmount: paymentData.downpaymentAmount || 0,
//             amountPaid: paymentData.amountPaid,
//             totalAmountDue: paymentData.totalAmountDue,
//             mode: paymentData.mode,
//             reference: paymentData.reference || null,
//             paymentStatus: paymentData.paymentStatus || 'pending',
//         }).returning();

//         // Calculate total amount paid so far
//         const totalPaid = await db
//             .select({ sum: sum(Payment.amountPaid) })
//             .from(Payment)
//             .where(eq(Payment.bookingId, paymentData.bookingId))
//             .get();

//         // Determine new billing status
//         //const newStatus = (totalPaid && totalPaid.sum !== null && totalPaid.sum >= paymentData.totalAmountDue) ? 'Paid' : 'Partially Paid';

//         // Update billing status
//         // await db.update(Billing)
//         //     .set({ status: newStatus })
//         //     .where(eq(Billing.bookingId, paymentData.bookingId));

//         return c.json({ message: 'Payment recorded successfully', paymentId: insertedPayment[0].paymentId }, 201);
//     } catch (error) {
//         console.error('Error processing payment:', error);
//         return c.text('Internal Server Error', 500);
//     }
// }

// export async function getPayments(c: Context) {
//     const payments = await db.select().from(Payment);
//     return c.json(payments);
// }
