import { type Context } from 'hono';
import { Discounts } from '../schemas/schema.ts';
import { eq } from 'drizzle-orm';
import db from '../config/database.ts';

// NOTE: NO ZOD and Middleware

// get all Discount and Promos
export async function getDiscountPromo (c:Context) {
    const discountPromo = await db.select().from(Discounts);

    return c.json(discountPromo);
}

// get Discount and Promos by ID
export async function getDiscountPromoById (c:Context) {
    const id = c.req.param('id');

    const discountPromo = await db.select()
                                  .from(Discounts)
                                  .where(eq(Discounts.discountPromoId, Number(id)));

    if (!discountPromo.length) {
        return c.text('Booking Add On not found', 404);
    }

    return c.json(discountPromo[0]);
}

// create new Discount and Promos
export async function createDiscountPromo (c:Context){
    const discountPromo = await c.req.json();

    await db.insert(Discounts).values({
        name: discountPromo.name,
        percentage: discountPromo.percentage,
        type: discountPromo.type,
    });

    return c.json({message: 'Discount and Promo created successfully'});
}

// update or edit Discount and Promos by ID
export async function updateDiscountPromo (c:Context) {
    const id = c.req.param('id');
    const body = await c.req.json();

    if(!Object.keys(body).length){
        return c.text('No data provided', 400);
    }

    const discountPromo = await db.select()
                                  .from(Discounts)
                                  .where(eq(Discounts.discountPromoId, Number(id)))
                                  .all();

    if(!discountPromo.length){
        return c.text('Discount and Promo not found', 404);
    }

    await db.update(Discounts)
            .set(body)
            .where(eq(Discounts.discountPromoId, Number(id)));

    return c.json({message: 'Discount and Promo updated successfully'});
}

// delete Discount and Promos by ID
export async function deleteDiscountPromo (c:Context){
    const id = c.req.param('id');
    
    const discountPromo = await db.select()
                                  .from(Discounts)
                                  .where(eq(Discounts.discountPromoId, Number(id)))
                                  .all();

    if(!discountPromo.length){
        return c.text('Discount and Promo not found', 404);
    }

    await db.delete(Discounts)
            .where(eq(Discounts.discountPromoId, Number(id)));

    return c.json({message: 'Discount and Promo deleted successfully'});
}