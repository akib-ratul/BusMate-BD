import { Router } from 'express';
import { chat } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
const router = Router();
router.post('/chat', authenticate, aiLimiter, chat);
export default router;
