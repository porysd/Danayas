import { Hono } from 'hono';
import { generateBilling, getBillings } from '../controllers/billingController';

const router = new Hono()
    .post('/', generateBilling)
    .get('/', getBillings);

export default router;
