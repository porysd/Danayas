import { type Context } from 'hono';
import { Packages } from '../schemas/schema.ts';
import db from '../config/database.ts';
import { eq } from 'drizzle-orm';

// NOTE: NO ZOD and Middleware
// NOTE: Need ng authentication for Admin to add, edit, update, delete packages


// get all PACKAGES
export async function getPackages (c:Context) {
    const packages = await db.select().from(Packages);
    return c.json(packages);
}

//get Package using ID
export async function getPackageById (c:Context){
    const id = c.req.param('id');

    const packages = await db.select()
                             .from(Packages)
                             .where(eq(Packages.packageId, Number(id)))
                             .all();

    if(!packages.length) {
        return c.text('Package not found', 404);
    }

    return c.json(packages[0]);
}

// create Packages
export async function createPackages (c:Context) {
    const packagesData = await c.req.json();

    await db.insert(Packages).values({
        name: packagesData.name,
        price: packagesData.price,
        description: packagesData.description,
        status: packagesData.status

    });

    return c.json({message: 'Package created successfully'});
}

// update or edit Pacakges by ID
export async function updatePackages (c:Context) {
    const id = c.req.param('id');
    const body = await c.req.json();

    if(!Object.keys(body).length) {
        return c.text('No data provided', 400);
    }

    const existingPackages = await db.select()
                                     .from(Packages)
                                     .where(eq(Packages.packageId, Number(id)))
                                     .all();

    if(!existingPackages.length) {
        return c.text('Package not found', 404);
    }

    await db.update(Packages)
            .set(body)
            .where(eq(Packages.packageId, Number(id)));

    return c.json({message: 'Package updated successfully'});
}

// delete Packages by ID
export async function deletePackages (c:Context) {
    const id = c.req.param('id');

    const existingPackages = await db .select()
                                      .from(Packages)
                                      .where(eq(Packages.packageId, Number(id)))
                                      .all();

    if(!existingPackages.length) {
        return c.text('Package not found', 404);
    }

    await db.delete(Packages)
            .where(eq(Packages.packageId, Number(id)));

    return c.json({message: 'Package deleted successfully'});
}

