import { Router } from 'express';
import { createSos, getSosAlerts, updateSos } from '../controllers/sos.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.post('/', authenticate, createSos);
router.get('/', authenticate, requireRole('ADMIN', 'OPERATOR'), getSosAlerts);
router.patch('/:id', authenticate, requireRole('ADMIN', 'OPERATOR'), updateSos);
export default router;
