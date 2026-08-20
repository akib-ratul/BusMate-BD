import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

const busSchema = z.object({
  name: z.string().min(2),
  busNumber: z.string().min(1),
  operatorId: z.string().uuid(),
  capacity: z.number().int().positive().default(50),
  routeId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('INACTIVE'),
});

export const getBuses = async (req: Request, res: Response) => {
  const { status, routeId, operatorId, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const where: any = {};
  if (status) where.status = status;
  if (routeId) where.routeId = routeId;
  if (operatorId) where.operatorId = operatorId;

  // Operators only see their own buses
  if (req.user?.role === 'OPERATOR') {
    const op = await prisma.transportOperator.findUnique({ where: { userId: req.user.userId } });
    if (op) where.operatorId = op.id;
  }

  const [buses, total] = await prisma.$transaction([
    prisma.bus.findMany({
      where,
      include: {
        route: { select: { id: true, name: true, startPoint: true, endPoint: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } },
        operator: { select: { organizationName: true } },
        crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 },
        ratings: { select: { stars: true } },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { busNumber: 'asc' },
    }),
    prisma.bus.count({ where }),
  ]);

  const enriched = buses.map(bus => ({
    ...bus,
    crowdLevel: bus.crowdReports[0]?.level || null,
    avgRating:
      bus.ratings.length > 0
        ? Math.round((bus.ratings.reduce((s, r) => s + r.stars, 0) / bus.ratings.length) * 10) / 10
        : null,
  }));

  res.json({ success: true, data: enriched, meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) } });
};

export const getBusById = async (req: Request, res: Response) => {
  const bus = await prisma.bus.findUnique({
    where: { id: req.params.id },
    include: {
      route: true,
      driver: { include: { user: { select: { name: true, phone: true } } } },
      operator: { select: { organizationName: true, contactEmail: true } },
      crowdReports: { orderBy: { reportedAt: 'desc' }, take: 5 },
      ratings: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!bus) throw new AppError('Bus not found', 404);

  const avgRating =
    bus.ratings.length > 0
      ? Math.round((bus.ratings.reduce((s, r) => s + r.stars, 0) / bus.ratings.length) * 10) / 10
      : null;

  res.json({ success: true, data: { ...bus, avgRating } });
};

export const createBus = async (req: Request, res: Response) => {
  const parsed = busSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);

  // Operator can only create buses for themselves
  if (req.user?.role === 'OPERATOR') {
    const op = await prisma.transportOperator.findUnique({ where: { userId: req.user.userId } });
    if (!op || op.id !== parsed.data.operatorId) throw new AppError('Access denied', 403);
  }

  const bus = await prisma.bus.create({
    data: parsed.data,
    include: { route: true, driver: true, operator: true },
  });
  res.status(201).json({ success: true, data: bus });
};

export const updateBus = async (req: Request, res: Response) => {
  const parsed = busSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);

  const existing = await prisma.bus.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError('Bus not found', 404);

  if (req.user?.role === 'OPERATOR') {
    const op = await prisma.transportOperator.findUnique({ where: { userId: req.user.userId } });
    if (!op || op.id !== existing.operatorId) throw new AppError('Access denied', 403);
  }

  const bus = await prisma.bus.update({
    where: { id: req.params.id },
    data: parsed.data,
    include: { route: true, driver: true },
  });
  res.json({ success: true, data: bus });
};

export const deleteBus = async (req: Request, res: Response) => {
  await prisma.bus.update({ where: { id: req.params.id }, data: { status: 'INACTIVE' } });
  res.json({ success: true, message: 'Bus deactivated' });
};

export const getLiveBuses = async (req: Request, res: Response) => {
  const buses = await prisma.bus.findMany({
    where: { status: 'ACTIVE', currentLat: { not: null } },
    include: {
      route: { select: { name: true, startPoint: true, endPoint: true } },
      driver: { include: { user: { select: { name: true } } } },
      crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 },
    },
    orderBy: { lastUpdated: 'desc' },
  });

  res.json({ success: true, data: buses });
};
