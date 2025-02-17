import { type Context } from 'hono';

export function bookingController (c: Context){
    return c.text("booking");
}

// Added some controllers :> 

export const createBooking = async (c: any) => {
    return c.json({ message: "Booking created!" });
};

export const getBooking = async (c: any) => {
    return c.json({ message: "All of the bookings"});
}