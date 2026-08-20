import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { getIO } from '../sockets';

const crowdSchema = z.object({
  busId: z.string().uuid(),
  level: z.enum(['LOW', 'MODERATE', 'HIGH', 'FULL']),
});

export const getCrowd = async (req: Request, res: Response) => {
  const { busId } = req.params;

  const latest = await prisma.crowdReport.findFirst({
    where: { busId },
    orderBy: { reportedAt: 'desc' },
    include: { user: { select: { name: true } } },
  });

  // Count recent reports (last 30 min)
  const since = new Date(Date.now() - 30 * 60 * 1000);
  const recentCounts = await prisma.crowdReport.groupBy({
    by: ['level'],
    where: { busId, reportedAt: { gte: since } },
    _count: true,
  });

  res.json({
    success: true,
    data: {
      latest,
      recentCounts,
    },
  });
};

export const reportCrowd = async (req: Request, res: Response) => {
  const parsed = crowdSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);

  const userId = req.user!.userId;
  const { busId, level } = parsed.data;

  // Rate limit: one report per bus per 5 minutes per user
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recent = await prisma.crowdReport.findFirst({
    where: { userId, busId, reportedAt: { gte: fiveMinAgo } },
  });
  if (recent) throw new AppError('Please wait 5 minutes before reporting again', 429);

  const report = await prisma.crowdReport.create({
    data: { busId, userId, level },
  });

  // Broadcast crowd update
  const io = getIO();
  io.to(`bus:${busId}`).emit('crowd:update', {
    busId,
    level,
    reportedAt: report.reportedAt,
  });
  io.to('buses:all').emit('crowd:update', { busId, level, reportedAt: report.reportedAt });

  res.status(201).json({ success: true, data: report });
};
