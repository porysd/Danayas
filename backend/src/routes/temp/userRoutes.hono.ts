import { Hono } from "hono";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CreateUserDTO, UpdateUserDTO, GetUserDTO } from "../../dto/userDTO";
import db from "../../config/database";
import { UsersTable } from "../../schemas/User";
import { eq, like, or } from "drizzle-orm";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../../utils/errors";
import { errorHandler } from "../../middlewares/errorHandler";
import { authMiddleware } from "../../middlewares/authMiddleware";
import type { AuthContext } from "../../types";
import { verifyPermission } from "../../utils/permissionUtils";
import { zValidator } from "@hono/zod-validator";

const paginationQuery = z.object({
  limit: z.coerce.number().min(1).default(10),
  page: z.coerce.number().min(1).default(1),
});

const userRoutes = new Hono()
  .get("/search", async (c) => {
    try {
      const rawQuery = c.req.query("query");
      const query = rawQuery?.trim();
      const limit = Number(c.req.query("limit") ?? "50");

      if (!query) {
        throw new BadRequestError("Query cannot be empty");
      }

      const users = await db.query.UsersTable.findMany({
        limit,
        where: or(
          like(UsersTable.email, `%${query}%`),
          like(UsersTable.firstName, `%${query}%`),
          like(UsersTable.lastName, `%${query}%`)
        ),
      });

      if (users.length === 0) {
        throw new NotFoundError("User not found");
      }

      return c.json({
        total: users.length,
        items: users.map((user) => ({
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        })),
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  })
  .get("/:id", async (c) => {
    try {
      const paramId = Number(c.req.param("id"));

      if (isNaN(paramId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const user = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userId, paramId),
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      try {
        const validatedUser = GetUserDTO.parse(user);
        return c.json(validatedUser);
      } catch (error) {
        throw new BadRequestError("Invalid user data structure");
      }
    } catch (err) {
      return errorHandler(err, c);
    }
  })

  .patch("/:id", zValidator("json", UpdateUserDTO), async (c) => {
    try {
      const paramId = Number(c.req.param("id"));
      if (isNaN(paramId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const user = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userId, paramId),
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      const updatedUser = UpdateUserDTO.parse(await c.req.json());

      await db
        .update(UsersTable)
        .set(updatedUser)
        .where(eq(UsersTable.userId, paramId))
        .execute();

      return c.json(updatedUser);
    } catch (err) {
      return errorHandler(err, c);
    }
  })
  .delete("/:id", async (c) => {
    try {
      const paramId = Number(c.req.param("id"));

      if (isNaN(paramId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const deletedUser = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userId, paramId),
      });

      if (!deletedUser) {
        throw new NotFoundError("User not found");
      }

      await db
        .delete(UsersTable)
        .where(eq(UsersTable.userId, paramId))
        .execute();

      return c.json({
        message: "User deleted successfully",
        user: deletedUser,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  })
  .get("/", zValidator("query", paginationQuery), async (c) => {
    try {
      const { limit, page } = c.req.valid("query");

      const users = await db.query.UsersTable.findMany({
        limit,
        offset: (page - 1) * limit,
      });

      const safeUsers = users.map((user) => GetUserDTO.parse(user));

      return c.json({
        total: safeUsers.length,
        items: safeUsers,
      });
    } catch (err) {
      return errorHandler(err, c);
    }
  })
  .post("/", zValidator("json", CreateUserDTO), async (c) => {
    try {
      const body = c.req.valid("json");

      const existingUser = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.email, body.email),
      });

      if (existingUser) {
        throw new ConflictError("User already exists");
      }

      const dbUser = (
        await db
          .insert(UsersTable)
          .values({
            ...body,
            password: await Bun.password.hash(body.password),
          })
          .returning()
          .execute()
      )[0];

      const { password, ...userWithoutPassword } = dbUser;

      return c.json(userWithoutPassword);
    } catch (err) {
      return errorHandler(err, c);
    }
  })
  .patch("/disable/:id", async (c) => {
    try {
      const paramId = Number(c.req.param("id"));
      if (isNaN(paramId)) {
        throw new BadRequestError("Invalid user ID");
      }
      const user = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userId, paramId),
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }
      await db
        .update(UsersTable)
        .set({ status: "disable" })
        .where(eq(UsersTable.userId, paramId))
        .execute();

      return c.json({ message: "User disabled successfully", paramId });
    } catch (err) {
      return errorHandler(err, c);
    }
  })
  .patch("/enable/:id", async (c) => {
    try {
      const paramId = Number(c.req.param("id"));
      if (isNaN(paramId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const user = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userId, paramId),
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      await db
        .update(UsersTable)
        .set({ status: "active" })
        .where(eq(UsersTable.userId, paramId))
        .execute();

      return c.json({ message: "User enabled successfully", paramId });
    } catch (err) {
      return errorHandler(err, c);
    }
  });

export default userRoutes;
