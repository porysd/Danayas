import { Hono } from 'hono';
import { getAllBooking,
        getOnlineBooking,
        getWalkInBooking,
        getBookingByID,
        createBooking, 
        updateBooking, 
        deleteBooking
} from '../controllers/bookingController';

const router = new Hono()
    .get('/booking', getAllBooking)
    .get('/booking/online', getOnlineBooking)
    .get('/booking/walkin', getWalkInBooking)
    .get('/booking/:id', getBookingByID)
    .post('/booking', createBooking)
    .put('/booking/:id', updateBooking)
    .delete('/booking/:id', deleteBooking);

export default router;
