import { Hono } from 'hono';
import {
    getUser,
    createUser,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/userController';

const router = new Hono()
    .get('/users', getUser)
    .post('/users', createUser)
    .get('/users/:id', getUserById)
    .put('/users/:id', updateUser)
    .delete('/users/:id', deleteUser);

export default router;
