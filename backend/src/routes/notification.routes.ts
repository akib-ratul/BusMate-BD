import { Router } from 'express';
import { getNotifications, markRead, markAllRead, broadcastNotification } from '../controllers/notification.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.post('/broadcast', requireRole('ADMIN', 'OPERATOR'), broadcastNotification);

export default router;
