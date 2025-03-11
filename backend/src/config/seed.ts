import { db } from './database';
import { Role, Booking } from '../schemas/schema.ts';
import { eq } from 'drizzle-orm';

// Seed roles
const roles = ['Admin', 'Staff', 'Customer'];

export async function seedRoles() {
  for (const roleName of roles) {

    const existingRole = await db.select()
                                 .from(Role)
                                 .where(eq(Role.name, roleName));

    if (existingRole.length === 0) {

      await db.insert(Role).values({ name: roleName });
      console.log(`Role "${roleName}" added.`);
    } else {
      console.log(`Role "${roleName}" already exists.`);
    }
  }
}