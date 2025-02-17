import { Hono } from 'hono';
import {
    getUsersController,
    getUserController,
    createUserController,
    updateUserController,
    deleteUserController
} from '../controllers/userController';

const router = new Hono()
    .get('/users', getUsersController)
    .get('/users/:id', getUserController)
    .post('/users', createUserController)
    .put('/users/:id', updateUserController)
    .delete('/users/:id', deleteUserController);

export default router;