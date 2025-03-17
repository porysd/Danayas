// import { type Context } from 'hono';
// import { db } from '../config/database';
// import { Role } from '../schemas/Roles';
// import { eq } from 'drizzle-orm';

// const allowedRoles = ['Admin', 'Staff', 'Customer'];

// // NOTE: No middleware to restrict access for Admin, Staff, and Customer roles

// // get all Roles
// export async function getRoles(c: Context) {
//     const roles = await db.select().from(Role);
//     return c.json(roles);
// };

// export async function createRole (c: Context) {
//     try {
//         const { name } = await c.req.json();

//         if (!allowedRoles.includes(name)) {
//             return c.text("Only Admin, Staff, and Customer roles are allowrd", 400);
//         }

//         const existingRole = await db.select()
//                                      .from(Role)
//                                      .where(eq(Role.name, name));
        
//         if (existingRole.length) {
//             return c.text("Role already exists", 400);
//         }

//         await db.insert(Role).values({ name });

//         return c.json({ message: "Role created successfully" }, 201);
//     } catch (error) {
//         console.error("Error creating role", error);
//         return c.text("Error", 500);
//     }
// }