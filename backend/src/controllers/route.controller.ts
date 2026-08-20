import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

const stopSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  order: z.number(),
});

const routeSchema = z.object({
  name: z.string().min(3),
  startPoint: z.string().min(2),
  endPoint: z.string().min(2),
  distance: z.number().positive(),
  estimatedDuration: z.number().positive(),
  baseFare: z.number().positive(),
  stops: z.array(stopSchema).default([]),
  isActive: z.boolean().default(true),
});

export const getRoutes = async (req: Request, res: Response) => {
  const { isActive, page = '1', limit = '50' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const where: any = {};
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [routes, total] = await prisma.$transaction([
    prisma.route.findMany({
      where,
      include: { buses: { select: { id: true, status: true } } },
      skip,
      take: parseInt(limit as string),
      orderBy: { name: 'asc' },
    }),
    prisma.route.count({ where }),
  ]);

  res.json({ success: true, data: routes, meta: { total } });
};

export const getRouteById = async (req: Request, res: Response) => {
  const route = await prisma.route.findUnique({
    where: { id: req.params.id },
    include: {
      buses: {
        include: {
          driver: { include: { user: { select: { name: true } } } },
          crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 },
        },
      },
    },
  });
  if (!route) throw new AppError('Route not found', 404);
  res.json({ success: true, data: route });
};

export const searchRoutes = async (req: Request, res: Response) => {
  const { from, to, sortBy = 'fastest' } = req.body;
  if (!from || !to) throw new AppError('From and To are required', 400);

  const fromLower = (from as string).toLowerCase();
  const toLower = (to as string).toLowerCase();

  // Find routes where stops or endpoints match
  const routes = await prisma.route.findMany({
    where: {
      isActive: true,
      OR: [
        { startPoint: { contains: fromLower, mode: 'insensitive' } },
        { endPoint: { contains: fromLower, mode: 'insensitive' } },
        { startPoint: { contains: toLower, mode: 'insensitive' } },
        { endPoint: { contains: toLower, mode: 'insensitive' } },
      ],
    },
    include: {
      buses: {
        where: { status: 'ACTIVE' },
        include: {
          crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 },
          driver: { include: { user: { select: { name: true } } } },
          ratings: { select: { stars: true } },
        },
      },
    },
  });

  // Score and enrich routes
  const enriched = routes.map(route => {
    const stopsJson = Array.isArray(route.stops) ? route.stops : [];
    const stops = stopsJson as Array<{ name: string; lat: number; lng: number; order: number }>;

    // Check if from/to appear in stops
    const fromInStops = stops.some(s => s.name.toLowerCase().includes(fromLower));
    const toInStops = stops.some(s => s.name.toLowerCase().includes(toLower));
    const fromInEndpoints =
      route.startPoint.toLowerCase().includes(fromLower) ||
      route.endPoint.toLowerCase().includes(fromLower);
    const toInEndpoints =
      route.startPoint.toLowerCase().includes(toLower) ||
      route.endPoint.toLowerCase().includes(toLower);

    const relevanceScore = (fromInStops || fromInEndpoints ? 1 : 0) + (toInStops || toInEndpoints ? 1 : 0);

    const activeBuses = route.buses.filter(b => b.status === 'ACTIVE');
    const crowd = activeBuses[0]?.crowdReports[0]?.level || 'LOW';
    const avgRating =
      activeBuses.flatMap(b => b.ratings).reduce((sum, r) => sum + r.stars, 0) /
        (activeBuses.flatMap(b => b.ratings).length || 1) || 0;

    return {
      ...route,
      activeBusCount: activeBuses.length,
      crowdLevel: crowd,
      avgRating: Math.round(avgRating * 10) / 10,
      relevanceScore,
      isLive: activeBuses.some(b => b.currentLat !== null),
    };
  });

  // Filter to only relevant routes
  const relevant = enriched.filter(r => r.relevanceScore > 0);

  // Sort
  const sorted = [...relevant].sort((a, b) => {
    if (sortBy === 'fastest') return a.estimatedDuration - b.estimatedDuration;
    if (sortBy === 'cheapest') return a.baseFare - b.baseFare;
    if (sortBy === 'shortest') return a.distance - b.distance;
    if (sortBy === 'least_crowded') {
      const order = { LOW: 0, MODERATE: 1, HIGH: 2, FULL: 3 };
      return (order[a.crowdLevel as keyof typeof order] || 0) - (order[b.crowdLevel as keyof typeof order] || 0);
    }
    return b.relevanceScore - a.relevanceScore;
  });

  res.json({ success: true, data: sorted, meta: { total: sorted.length } });
};

export const createRoute = async (req: Request, res: Response) => {
  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);

  const route = await prisma.route.create({ data: parsed.data });
  res.status(201).json({ success: true, data: route });
};

export const updateRoute = async (req: Request, res: Response) => {
  const parsed = routeSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);

  const route = await prisma.route.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json({ success: true, data: route });
};

export const deleteRoute = async (req: Request, res: Response) => {
  await prisma.route.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true, message: 'Route deactivated' });
};
