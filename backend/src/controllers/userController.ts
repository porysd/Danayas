import { type Context } from 'hono';
import { auth } from 'hono/utils/basic-auth';

export function getUsersController (c: Context){
    return c.text("Get All hjhjgUsers");
}

export function getUserController (c: Context){
    const { id } = c.req.param();
    const { name } = c.req.query();

    return c.text(`Hello User ${id} ${name}`);
}

export async function createUserController (c: Context){
    const headers = c.req.param("authorization");
    const body = await c.req.json();

    return c.text(`Create User ${JSON.stringify(body)}`);
}

export function updateUserController (c: Context){
    return c.text("Update User");
}

export function deleteUserController (c: Context){
    return c.text("Delete User");
}


// Added some controllers :>

export const getUser = async (c: any) => {
    const { userId} = await c.req.json();
    return c.json({ message: `User: ${userId}` });
};

export const updateUser = async (c: any) => {
    const { userId} = await c.req.json();
    return c.json({ message: `User: ${userId} updated!` });
}