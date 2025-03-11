import { Hono } from 'hono';
import {
    getBookingAddOn,
    createBookingAddOn,
    getBooknigAddOnById,
    updateBookingAddOn,
    deleteBookingAddON
} from '../controllers/bookingAddOnController';

const router = new Hono()
    .get('/booking/addons', getBookingAddOn)
    .post('/booking/addons', createBookingAddOn)
    .get('/booking/addons/:id', getBooknigAddOnById)
    .put('/booking/addons/:id', updateBookingAddOn)
    .delete('/booking/addons/:id', deleteBookingAddON);

export default router;