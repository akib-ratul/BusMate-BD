import { Router } from 'express';
import { getLostFound, createLostFound, updateLostFound, deleteLostFound } from '../controllers/lostFound.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
router.get('/', optionalAuth, getLostFound);
router.post('/', authenticate, createLostFound);
router.patch('/:id', authenticate, updateLostFound);
router.delete('/:id', authenticate, deleteLostFound);
export default router;
