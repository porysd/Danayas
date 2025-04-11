import { verify } from 'hono/jwt';
import type { Context, Next } from 'hono';

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authorizationHeader = c.req.header("Authorization");
    if (!authorizationHeader) {
      return c.json({ error: "Authorization header is missing" }, 401);
    }

    const accessToken = authorizationHeader.split("Bearer ")[1];
    if (!accessToken) {
      return c.json({ error: "Bearer token is missing" }, 401);
    }

    const decoded = await verify(accessToken, Bun.env.JWT_ACCESS_SECRET!); 

    if (!decoded) {
      return c.json({ message: "Unauthorized, invalid token" }, 401);
    }

//     c.set("userId", decoded.sub);
//     c.set("role", decoded.role);

    await next();
  } catch (error) {
    return c.json({ message: "Unauthorized, invalid token" }, 401);
  }
}
