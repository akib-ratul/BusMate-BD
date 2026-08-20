import { Router } from 'express';
import { getBuses, getBusById, createBus, updateBus, deleteBus, getLiveBuses } from '../controllers/bus.controller';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getBuses);
router.get('/live', optionalAuth, getLiveBuses);
router.get('/:id', optionalAuth, getBusById);
router.post('/', authenticate, requireRole('OPERATOR', 'ADMIN'), createBus);
router.patch('/:id', authenticate, requireRole('OPERATOR', 'ADMIN'), updateBus);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteBus);

export default router;
