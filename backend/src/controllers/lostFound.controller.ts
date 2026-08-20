import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

const lostFoundSchema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  imageUrl: z.string().url().optional(),
  location: z.string().min(2),
  date: z.string().datetime().or(z.string()),
});

export const getLostFound = async (req: Request, res: Response) => {
  const { type, status, page = '1', limit = '12' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const where: any = { isApproved: true };
  if (type) where.type = type;
  if (status) where.status = status;

  const [items, total] = await prisma.$transaction([
    prisma.lostFound.findMany({
      where,
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.lostFound.count({ where }),
  ]);

  res.json({ success: true, data: items, meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) } });
};

export const createLostFound = async (req: Request, res: Response) => {
  const parsed = lostFoundSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);

  const userId = req.user!.userId;
  const item = await prisma.lostFound.create({
    data: { ...parsed.data, userId, date: new Date(parsed.data.date) },
    include: { user: { select: { name: true } } },
  });

  res.status(201).json({ success: true, data: item });
};

export const updateLostFound = async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await prisma.lostFound.findUnique({ where: { id } });
  if (!item) throw new AppError('Item not found', 404);

  // Only owner or admin can update
  if (req.user?.role !== 'ADMIN' && item.userId !== req.user?.userId) {
    throw new AppError('Access denied', 403);
  }

  const allowed = ['status', 'description', 'isApproved'];
  const data: any = {};
  allowed.forEach(key => {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  });

  const updated = await prisma.lostFound.update({ where: { id }, data });
  res.json({ success: true, data: updated });
};

export const deleteLostFound = async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await prisma.lostFound.findUnique({ where: { id } });
  if (!item) throw new AppError('Item not found', 404);

  if (req.user?.role !== 'ADMIN' && item.userId !== req.user?.userId) {
    throw new AppError('Access denied', 403);
  }

  await prisma.lostFound.delete({ where: { id } });
  res.json({ success: true, message: 'Deleted' });
};
