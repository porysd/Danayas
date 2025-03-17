// import { type Context } from 'hono';
// import { bookingAddOn, Booking } from '../schemas/schema.ts';
// import { eq } from 'drizzle-orm';
// import db from '../config/database.ts';

// // NOTE: NO ZOD and Middleware

// // get all Booking Add Ons
// export async function getBookingAddOn (c:Context) {
//     const bookingAddOns = await db.select().from(bookingAddOn);

//     return c.json(bookingAddOns);
// }

// // get Booking Add On by ID
// export async function getBooknigAddOnById (c:Context) {
//     const id = c.req.param('id');

//     const bookingAddOns = await db.select()
//                                   .from(bookingAddOn)
//                                   .where(eq(bookingAddOn.addOnId, Number(id)));

//     if (!bookingAddOns.length) {
//         return c.text('Booking Add On not found', 404);
//     }

//     return c.json(bookingAddOns[0]);
// }

// // create new Booknig Add On
// export async function createBookingAddOn (c:Context){
//     const addOnData = await c.req.json();

//     await db.insert(bookingAddOn).values({
//         bookingId: addOnData.bookingId,
//         itemName: addOnData.itemName,
//         quantity: addOnData.quantity,
//         price: addOnData.price,
//         totalPrice: addOnData.totalPrice // Need logic to sum up the total price
//     });

//     return c.json({message: 'Booking Add On created successfully'});
// }

// // update or edit Booking Add On
// export async function updateBookingAddOn (c:Context) {
//     const id = c.req.param('id');
//     const body = await c.req.json();

//     if(!Object.keys(body).length){
//         return c.text('No data provided', 400);
//     }

//     const existingAddOn = await db.select()
//                                   .from(bookingAddOn)
//                                   .where(eq(bookingAddOn.addOnId, Number(id)))
//                                   .all();

//     if(!existingAddOn.length){
//         return c.text('Booking Add On not found', 404);
//     }

//     await db.update(bookingAddOn)
//             .set(body)
//             .where(eq(bookingAddOn.addOnId, Number(id)));

//     return c.json({message: 'Booking Add On updated successfully'});
// }

// // delete booknig Add On by ID
// export async function deleteBookingAddON (c:Context){
//     const id = c.req.param('id');
    
//     const existingAddOn = await db.select()
//                                   .from(bookingAddOn)
//                                   .where(eq(bookingAddOn.addOnId, Number(id)))
//                                   .all();

//     if(!existingAddOn.length){
//         return c.text('Booking Add On not found', 404);
//     }

//     await db.delete(bookingAddOn)
//             .where(eq(bookingAddOn.addOnId, Number(id)));

//     return c.json({message: 'Booking Add On deleted successfully'});
// }