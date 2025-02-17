import { type Context } from 'hono';

export function getUsersController (c: Context){
    return c.text("Get All Users");
}

export function getUserController (c: Context){
    return c.text("Get User");
}

export function createUserController (c: Context){
    return c.text("Create User");
}

export function updateUserController (c: Context){
    return c.text("Update User");
}

export function deleteUserController (c: Context){
    return c.text("Delete User");
}


// Added some controllers :>

export const createReservation = async (c: any) => {
    const reservationDetails = await c.req.json();
    return c.json({ message: "Reservation created!" });
};

export const updateReservation = async (c: any) => {
    const { id } = c.req.param();
    return c.json({ message: `Reservation ${ id } updated!` });
};

export const deleteReservation = async (c: any) => {
    const { id } = c.req.param();
    return c.json({ message: `Reservation ${ id } deleted!` });
}