import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

const ratingSchema = z.object({
  busId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  stars: z.number().int().min(1).max(5),
  review: z.string().max(500).optional(),
});

export const getBusRatings = async (req: Request, res: Response) => {
  const { busId } = req.params;
  const { page = '1', limit = '10' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const [ratings, total] = await prisma.$transaction([
    prisma.rating.findMany({
      where: { busId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.rating.count({ where: { busId } }),
  ]);

  const avg =
    ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / ratings.length) * 10) / 10
      : 0;

  res.json({ success: true, data: ratings, meta: { total, avg } });
};

export const getDriverRatings = async (req: Request, res: Response) => {
  const { driverId } = req.params;
  const ratings = await prisma.rating.findMany({
    where: { driverId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  const avg =
    ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / ratings.length) * 10) / 10
      : 0;
  res.json({ success: true, data: ratings, meta: { avg, total: ratings.length } });
};

export const createRating = async (req: Request, res: Response) => {
  const parsed = ratingSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);

  const { busId, driverId, stars, review } = parsed.data;
  if (!busId && !driverId) throw new AppError('busId or driverId is required', 400);

  const userId = req.user!.userId;

  // Prevent duplicate rating within 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await prisma.rating.findFirst({
    where: {
      userId,
      OR: [
        ...(busId ? [{ busId }] : []),
        ...(driverId ? [{ driverId }] : []),
      ],
      createdAt: { gte: oneDayAgo },
    },
  });
  if (existing) throw new AppError('You have already rated this in the last 24 hours', 409);

  const rating = await prisma.rating.create({
    data: { userId, busId, driverId, stars, review },
    include: { user: { select: { name: true } } },
  });

  res.status(201).json({ success: true, data: rating });
};
