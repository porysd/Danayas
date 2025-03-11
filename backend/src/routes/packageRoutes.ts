import { Hono } from 'hono';
import {
        getPackages,
        getPackageById,
        createPackages,
        updatePackages,
        deletePackages
} from '../controllers/packageController';

const router = new Hono()
    .get('/packages', getPackages)
    .post('/packages', createPackages)
    .get('/packages/:id', getPackageById)
    .put('/packages/:id', updatePackages)
    .delete('/packages/:id', deletePackages);

export default router;