import { type Context } from 'hono';
import { auth } from 'hono/utils/basic-auth';
import { User, Role } from '../schemas/schema.ts';
import db from '../config/database.ts';
import { eq } from 'drizzle-orm';
import { usersSync } from 'drizzle-orm/neon';
import { use } from 'hono/jsx';

// NOTE: NO ZOD and Middleware

// get all Users with Roles without password
export async function getUser(c: Context) {
  const users = await db
    .select({
      userId: User.userId,
      firstName: User.firstName,
      lastName: User.lastName,
      contactNo: User.contactNo,
      address: User.address,
      status: User.status,
      email: User.email,
      roleId: User.roleId,
      roleName: Role.name, 
    })
    .from(User)
    .innerJoin(Role, eq(User.roleId, Role.roleId)); 

  return c.json(users);
}

// get User by ID with Role without password
export async function getUserById(c: Context) {
  const id = c.req.param('id');

  const users = await db
    .select({
      userId: User.userId,
      firstName: User.firstName,
      lastName: User.lastName,
      contactNo: User.contactNo,
      address: User.address,
      status: User.status,
      email: User.email,
      roleId: User.roleId,
      roleName: Role.name,
    })
    .from(User)
    .innerJoin(Role, eq(User.roleId, Role.roleId))
    .where(eq(User.userId, Number(id)));

  if (!users.length) {
    return c.text('User not found', 404);
  }

  return c.json(users[0]);
}


// create new User with Role
export async function createUser(c: Context) {
  try {
    const userData = await c.req.json();

    // Check if role exists
    const existingRole = await db.select()
                              .from(Role)
                              .where(eq(Role.roleId, userData.roleId));

    if (!existingRole.length) {
      return c.text('Invalid role ID', 400);
    }

    // Insert new user
    await db.insert(User).values({
      firstName: userData.firstName,
      lastName: userData.lastName,
      contactNo: userData.contactNo,
      address: userData.address,
      status: userData.status,
      email: userData.email,
      password: userData.password,
      roleId: userData.roleId,
    });

    return c.json({ message: 'User created successfully' }, 201);

  } catch (error) {
    console.error('Error creating user', error);
    return c.text('Error', 500);
  }
}

// update User by ID
export async function updateUser (c: Context) {
    try {
        const id = c.req.param('id');
        const body = await c.req.json(); 

        // get data from request body
        if (!Object.keys(body).length) { 
          return c.text("Request body is empty", 400);
        }

        const existingUser = await db .select()
                                      .from(User)
                                      .where(eq(User.userId, Number(id)))
                                      .all();

        if (!existingUser.length) {
            return c.text("User not found", 404);
        }

        await db.update(User)
                .set(body)
                .where(eq(User.userId, Number(id)));

        return c.json({ message: "User updated successfully!" });
    } catch (error) {
        console.error("Error updating user:", error);
        return c.text("Internal Server Error", 500);
    }
};

// delete User by ID
export async function deleteUser (c: Context){
    try {
        const id = c.req.param("id");

        const existingUser = await db .select()
                                      .from(User)
                                      .where(eq(User.userId, Number(id)))
                                      .all();
                                      
        if (!existingUser.length) {
            return c.text("User not found", 404);
        }

        await db.delete(User)
                .where(eq(User.userId, Number(id)));

        return c.json({ message: "User deleted successfully!" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return c.text("Internal Server Error", 500);
    }
};