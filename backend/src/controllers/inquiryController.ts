import { type Context } from 'hono';

export function inquiryController (c: Context){
    return c.text("inquiry");
}

// Added some controllers :>

export const createInquiry = async (c: any) => {
    return c.json({ message: "Inquiry created!" });
};

export const getInquiry = async (c: any) => {
    return c.json({ message: "All of the inquiries"});
};