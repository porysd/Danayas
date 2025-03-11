import { Hono } from 'hono';
import {
    getDiscountPromo,
    createDiscountPromo,
    getDiscountPromoById,
    updateDiscountPromo,
    deleteDiscountPromo
} from '../controllers/discountController';

const router = new Hono()
    .get('/discountpromo', getDiscountPromo)
    .post('/discountpromo', createDiscountPromo)
    .get('/discountpromo/:id', getDiscountPromoById)
    .put('/discountpromo/:id', updateDiscountPromo)
    .delete('/discountpromo/:id', deleteDiscountPromo);

export default router;