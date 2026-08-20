import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, toggleUserStatus } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('ADMIN'), getUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', requireRole('ADMIN'), deleteUser);
router.patch('/:id/toggle-status', requireRole('ADMIN'), toggleUserStatus);

export default router;
