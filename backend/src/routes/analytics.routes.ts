import { Router } from 'express';
import { getOperatorAnalytics, getAdminAnalytics, getSystemSettings, updateSystemSettings, updateSystemSetting, getTripsByUser, createTrip } from '../controllers/analytics.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/operator', requireRole('OPERATOR'), getOperatorAnalytics);
router.get('/admin', requireRole('ADMIN'), getAdminAnalytics);
router.get('/settings', requireRole('ADMIN'), getSystemSettings);
router.patch('/settings', requireRole('ADMIN'), updateSystemSettings);
router.patch('/settings/:key', requireRole('ADMIN'), updateSystemSetting);
router.get('/trips', getTripsByUser);
router.post('/trips', requireRole('PASSENGER'), createTrip);

export default router;

