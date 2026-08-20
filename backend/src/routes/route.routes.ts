import { Router } from 'express';
import { getRoutes, getRouteById, searchRoutes, createRoute, updateRoute, deleteRoute } from '../controllers/route.controller';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getRoutes);
router.post('/search', optionalAuth, searchRoutes);
router.get('/:id', optionalAuth, getRouteById);
router.post('/', authenticate, requireRole('OPERATOR', 'ADMIN'), createRoute);
router.patch('/:id', authenticate, requireRole('OPERATOR', 'ADMIN'), updateRoute);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteRoute);

export default router;
