import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { getIO } from '../sockets';

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const [notifications, total, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  res.json({ success: true, data: notifications, meta: { total, unreadCount } });
};

export const markRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif || notif.userId !== userId) throw new AppError('Not found', 404);

  const updated = await prisma.notification.update({ where: { id }, data: { isRead: true } });
  res.json({ success: true, data: updated });
};

export const markAllRead = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  res.json({ success: true, message: 'All marked as read' });
};

const broadcastSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(5),
  type: z.enum(['ROUTE_UPDATE', 'BUS_UPDATE', 'CROWD', 'SOS', 'LOST_FOUND', 'ANNOUNCEMENT', 'SYSTEM']).default('ANNOUNCEMENT'),
  targetRole: z.enum(['ALL', 'PASSENGER', 'DRIVER', 'OPERATOR']).default('ALL'),
});

export const broadcastNotification = async (req: Request, res: Response) => {
  const parsed = broadcastSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);

  const { title, message, type, targetRole } = parsed.data;

  const where: any = { isActive: true };
  if (targetRole !== 'ALL') where.role = targetRole;

  const users = await prisma.user.findMany({ where, select: { id: true } });

  const notifications = await prisma.notification.createMany({
    data: users.map(u => ({ userId: u.id, title, message, type: type as any })),
  });

  // Real-time push
  const io = getIO();
  const payload = { title, message, type, createdAt: new Date() };
  if (targetRole === 'ALL') {
    io.emit('notification:new', payload);
  } else {
    io.to(`role:${targetRole.toLowerCase()}`).emit('notification:new', payload);
  }

  res.json({ success: true, message: `Sent to ${notifications.count} users` });
};
