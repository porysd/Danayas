import { type Context } from 'hono';

export function getPaymentController (c: Context){
    return c.text("payment");
}

// Added some controllers :>

export const processPayment = async (c: any) => {
    return c.json({ message: "Payment processed!" });
};

export const getPayment = async (c: any) => {
    return c.json({ message: "All of the payments"});
};