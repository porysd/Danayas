import { Hono } from 'hono';
import { getRoles, 
         createRole } from '../controllers/roleController';

const router = new Hono()
    .get('/roles', getRoles)
    .post('/roles', createRole);

export default router;
