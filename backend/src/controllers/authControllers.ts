import { type Context } from 'hono';

export function getAuthController (c: Context){
    return c.text("Auth");
}


// Added some controllers :>

export const registerUser = async (c: any) => {
    const { username, password } = await c.req.json();
    return c.json({ message: `User ${username} registered successfully!` });
};

export const loginUser = async (c: any) => {
    const { username, password } = await c.req.json();
    return c.json({ message: `User ${username} logged in successfully!` });
};