import { Router } from 'express';
import { calculateFare } from '../controllers/fare.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();
router.post('/calculate', optionalAuth, calculateFare);
export default router;
