import { Router } from 'express';
import { getBusRatings, getDriverRatings, createRating } from '../controllers/rating.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
router.get('/bus/:busId', optionalAuth, getBusRatings);
router.get('/driver/:driverId', optionalAuth, getDriverRatings);
router.post('/', authenticate, createRating);
export default router;
