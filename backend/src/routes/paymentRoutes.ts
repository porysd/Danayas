import { Hono } from 'hono';
import { createPayment, getPayments } from '../controllers/paymentController';

const router = new Hono()
    .post('/', createPayment)
    .get('/', getPayments);

export default router;
