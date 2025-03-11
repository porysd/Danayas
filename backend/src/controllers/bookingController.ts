import { type Context } from 'hono';
import { Booking, User, Role, Packages, Discounts } from '../schemas/schema.ts';
import db from '../config/database.ts';
import { eq } from 'drizzle-orm';

// NOTE: NO ZOD and Middleware


// get all BOOKING
export async function getAllBooking(c: Context) {
    const bookings = await db
    .select()
    .from(Booking)
    .leftJoin(User, eq(Booking.userId, User.userId))
    .leftJoin(Packages, eq(Booking.packageId, Packages.packageId))
    .leftJoin(Discounts, eq(Booking.discountPromoId, Discounts.discountPromoId));

    return c.json(bookings);
}


// get all ONLINE BOOKING
export async function getOnlineBooking(c: Context) {
    const bookings = await db
        .select()
        .from(Booking)
        .where(eq(Booking.reservationType, 'Online'))
        .leftJoin(User, eq(Booking.userId, User.userId))
        .leftJoin(Packages, eq(Booking.packageId, Packages.packageId))
        .leftJoin(Discounts, eq(Booking.discountPromoId, Discounts.discountPromoId));

    return c.json(bookings);
}


// get all WALK-IN BOOKING
export async function getWalkInBooking(c: Context) {
    const bookings = await db
        .select()
        .from(Booking)
        .where(eq(Booking.reservationType, 'Walk-In'))
        .leftJoin(User, eq(Booking.userId, User.userId))
        .leftJoin(Packages, eq(Booking.packageId, Packages.packageId))
        .leftJoin(Discounts, eq(Booking.discountPromoId, Discounts.discountPromoId));

    return c.json(bookings);
}


// get Booking by ID
export async function getBookingByID(c: Context) {
    const id = c.req.param("id");
    const reservation = await db
                        .select()
                        .from(Booking)
                        .where(eq(Booking.bookingId, Number(id)))
                        .get();

    if (!reservation) {
        return c.text("Not found", 404);
    }
    return c.json(reservation);
}



// create new Booking for Online (Customer) and Walk-in (Staff)
export async function createBooking(c: Context) {
    try {
        const bookingData = await c.req.json();

        const reservationType = bookingData.reservationType || 'Online';

        if (reservationType === 'Online' && !bookingData.userId) {
            return c.text("User ID is required", 400);
        }

        if (reservationType === 'Walk-in' && !bookingData.createdBy) {
            return c.text("Staff member only", 400);
        }

        let userDetails = null;

        if (bookingData.userId) {
            userDetails = await db.select()
                                .from(User)
                                .where(eq(User.userId, bookingData.userId))
                                .get();

            if (!userDetails) {
                return c.text("User not found", 400);
            }
        }

        await db.insert(Booking).values({
            userId: bookingData.userId || null,
            createdBy: bookingData.createdBy || bookingData.userId,
            checkInDate: bookingData.checkInDate,
            checkOutDate: bookingData.checkOutDate,
            mode: bookingData.mode,
            packageId: bookingData.packageId,
            firstName: bookingData.firstName || userDetails?.firstName || null,
            lastName: bookingData.lastName || userDetails?.lastName || null,
            arrivalTime: bookingData.arrivalTime,
            eventType: bookingData.eventType,
            numberOfGuest: bookingData.numberOfGuest,
            catering: bookingData.catering,
            contactNo: bookingData.contactNo || userDetails?.contactNo || null,
            emailAddress: bookingData.emailAddress || userDetails?.email || null,
            address: bookingData.address || userDetails?.address || null,
            discountPromoId: bookingData.discountPromoId,
            paymentTerms: bookingData.paymentTerms,
            totalAmountDue: bookingData.totalAmountDue,
            bookStatus: 'Pending', // Default status is pending
            reservationType,
        })

        return c.json({ message: `Reservation created successfully as ${reservationType}` }, 201);
        
    } catch (error) {
        console.error("Error creating reservation:", error);
        return c.text("Internal Server Error", 500);
    }
}



// NOTE: This can only update checkInDate and checkOutDate
// update Booking using ID
export async function updateBooking(c: Context) {
    try {
        const id = Number(c.req.param("id")!);
        const updates = await c.req.json();

        const existingReservation = await db.select()
                                            .from(Booking)
                                            .where(eq(Booking.bookingId, Number(id)))
                                            .get();

        if (!existingReservation) {
            return c.text("Not found", 404);
        }

        await db.update(Booking)
            .set({
                checkInDate: updates.checkInDate,
                checkOutDate: updates.checkOutDate,
            })
            .where(eq(Booking.bookingId, id));

        return c.json({ message: "Reservation updated successfully" });
    } catch (error) {
        console.error("Error updating reservation:", error);
        return c.text("Internal Server Error", 500);
    }
}



// delete Booking using ID
export async function deleteBooking(c: Context) {
    try {
        const id = Number(c.req.param("id")!);

        const existingReservation = await db
            .select()
            .from(Booking)
            .where(eq(Booking.bookingId, Number(id)))
            .get();

        if (!existingReservation) {
            return c.text("Not found", 404);
        }

        await db.delete(Booking).where(eq(Booking.bookingId, id));

        return c.json({ message: "Reservation deleted successfully" });
    } catch (error) {
        console.error("Error deleting reservation:", error);
        return c.text("Internal Server Error", 500);
    }
}