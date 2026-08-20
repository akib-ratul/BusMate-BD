import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { getIO } from '../sockets';
import { createNotificationsForAdmins } from '../services/notification.service';

const sosSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  message: z.string().max(500).optional(),
});

export const createSos = async (req: Request, res: Response) => {
  const parsed = sosSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);

  const userId = req.user!.userId;
  const alert = await prisma.sosAlert.create({
    data: { userId, ...parsed.data },
    include: { user: { select: { name: true, phone: true } } },
  });

  // Notify admins via Socket.IO
  const io = getIO();
  io.to('room:admin').emit('sos:new', { alert });
  io.to('room:operator').emit('sos:new', { alert });

  // Create notifications for admins
  await createNotificationsForAdmins({
    title: '🆘 SOS Alert',
    message: `Emergency from ${alert.user.name}. ${alert.message || 'No message provided.'}`,
    type: 'SOS',
  });

  res.status(201).json({ success: true, data: alert });
};

export const getMySos = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const alerts = await prisma.sosAlert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  res.json({ success: true, data: alerts });
};

export const getSosAlerts = async (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const where: any = {};
  if (status) where.status = status;

  const [alerts, total] = await prisma.$transaction([
    prisma.sosAlert.findMany({
      where,
      include: { user: { select: { name: true, phone: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.sosAlert.count({ where }),
  ]);

  res.json({ success: true, data: alerts, meta: { total } });
};

export const updateSos = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['ACKNOWLEDGED', 'RESOLVED'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const alert = await prisma.sosAlert.update({
    where: { id },
    data: {
      status,
      resolvedBy: req.user!.userId,
      resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
    },
    include: { user: { select: { name: true } } },
  });

  // Notify via socket
  const io = getIO();
  io.to('room:admin').emit('sos:update', { alert });

  // Notify the user
  await prisma.notification.create({
    data: {
      userId: alert.userId,
      title: 'Your SOS Alert Update',
      message: `Your emergency alert has been ${status.toLowerCase()} by our team.`,
      type: 'SOS',
    },
  });

  res.json({ success: true, data: alert });
};
