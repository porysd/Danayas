import { type Context } from 'hono';
import db from '../config/database.ts';
import { Billing } from '../schemas/Billing.ts';
import { eq } from 'drizzle-orm';

// NOTE: NO ZOD and Middleware

// FUTURE MEDYO MADUGO TO
export async function generateBilling(c: Context) {
    try {
        const billingData = await c.req.json();

        await db.insert(Billing).values({
            bookingId: billingData.bookingId,
            paymentId: billingData.paymentId || null,
            totalAmount: billingData.totalAmount,
            status: billingData.status || 'Unpaid',
        });

        return c.json({ message: 'Billing generated successfully' }, 201);
    } catch (error) {
        console.error('Error generating billing:', error);
        return c.text('Internal Server Error', 500);
    }
}

export async function getBillings(c: Context) {
    const billings = await db.select().from(Billing);
    return c.json(billings);
}
