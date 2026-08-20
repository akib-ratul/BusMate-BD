import { Router } from 'express';
import { getCrowd, reportCrowd } from '../controllers/crowd.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const crowdLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 3 });
const router = Router();

router.get('/:busId', optionalAuth, getCrowd);
router.post('/', authenticate, crowdLimiter, reportCrowd);

export default router;
