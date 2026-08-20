import { Router } from 'express';
import { updateLocation, getTrackingBuses, getTrackingBus } from '../controllers/tracking.controller';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth';

const router = Router();
router.post('/location', authenticate, requireRole('DRIVER', 'ADMIN'), updateLocation);
router.get('/buses', optionalAuth, getTrackingBuses);
router.get('/buses/:id', optionalAuth, getTrackingBus);
export default router;
