import { verify } from "hono/jwt";
import type { Context, Next } from "hono";
import { UnauthorizedError } from "../utils/errors";
import { errorHandler } from "../middlewares/errorHandler";

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authorizationHeader = c.req.header("Authorization");
    if (!authorizationHeader) {
      throw new UnauthorizedError("Authorization header is missing");
    }

    const accessToken = authorizationHeader.split("Bearer ")[1];
    if (!accessToken) {
      throw new UnauthorizedError("Access token is missing");
    }

    const decoded = await verify(accessToken, Bun.env.JWT_ACCESS_SECRET!);

    if (!decoded) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    c.set("userId", decoded.sub);
    c.set("role", decoded.role);

    await next();
  } catch (err) {
    return errorHandler(err, c);
  }
}
