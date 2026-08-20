import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';


export const getOperatorAnalytics = async (req: Request, res: Response) => {
  const op = await prisma.transportOperator.findUnique({ where: { userId: req.user!.userId } });
  if (!op) throw new AppError('Operator profile not found', 404);

  const buses = await prisma.bus.findMany({
    where: { operatorId: op.id },
    include: {
      crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 },
      ratings: { select: { stars: true } },
      trips: { orderBy: { startedAt: 'desc' }, take: 100 },
    },
  });

  const totalBuses = buses.length;
  const activeBuses = buses.filter(b => b.status === 'ACTIVE').length;
  const inactiveBuses = buses.filter(b => b.status === 'INACTIVE').length;
  const maintenanceBuses = buses.filter(b => b.status === 'MAINTENANCE').length;

  const allRatings = buses.flatMap(b => b.ratings);
  const avgRating = allRatings.length > 0
    ? Math.round((allRatings.reduce((s, r) => s + r.stars, 0) / allRatings.length) * 10) / 10
    : 0;

  const allTrips = buses.flatMap(b => b.trips);

  // Trips per day (last 7 days)
  const tripsPerDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split('T')[0];
    const count = allTrips.filter(t => t.startedAt.toISOString().startsWith(dayStr)).length;
    tripsPerDay.push({ date: dayStr, trips: count });
  }

  // Route popularity
  const routeTrips = await prisma.trip.groupBy({
    by: ['routeId'],
    where: { busId: { in: buses.map(b => b.id) } },
    _count: true,
    orderBy: { _count: { routeId: 'desc' } },
    take: 5,
  });

  const routes = await prisma.route.findMany({
    where: { id: { in: routeTrips.map(r => r.routeId) } },
    select: { id: true, name: true },
  });

  const popularRoutes = routeTrips.map(rt => ({
    routeId: rt.routeId,
    name: routes.find(r => r.id === rt.routeId)?.name || 'Unknown',
    trips: rt._count,
  }));

  // Crowd trend
  const crowdTrend = buses.map(b => ({
    busNumber: b.busNumber,
    name: b.name,
    crowd: b.crowdReports[0]?.level || 'UNKNOWN',
  }));

  res.json({
    success: true,
    data: {
      summary: { totalBuses, activeBuses, inactiveBuses, maintenanceBuses, avgRating, totalTrips: allTrips.length },
      tripsPerDay,
      popularRoutes,
      crowdTrend,
      ratingDistribution: [1, 2, 3, 4, 5].map(star => ({
        star,
        count: allRatings.filter(r => r.stars === star).length,
      })),
    },
  });
};

export const getAdminAnalytics = async (req: Request, res: Response) => {
  const [
    totalUsers,
    passengers,
    drivers,
    operators,
    totalBuses,
    activeBuses,
    totalRoutes,
    activeRoutes,
    activeSos,
    openLostFound,
    totalTrips,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PASSENGER' } }),
    prisma.user.count({ where: { role: 'DRIVER' } }),
    prisma.user.count({ where: { role: 'OPERATOR' } }),
    prisma.bus.count(),
    prisma.bus.count({ where: { status: 'ACTIVE' } }),
    prisma.route.count(),
    prisma.route.count({ where: { isActive: true } }),
    prisma.sosAlert.count({ where: { status: 'ACTIVE' } }),
    prisma.lostFound.count({ where: { status: 'OPEN' } }),
    prisma.trip.count(),
  ]);

  // Users per day (last 7 days)
  const usersPerDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));
    const count = await prisma.user.count({ where: { createdAt: { gte: start, lte: end } } });
    usersPerDay.push({ date: start.toISOString().split('T')[0], users: count });
  }

  // Trips per day
  const tripsPerDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split('T')[0];
    const count = await prisma.trip.count({
      where: { startedAt: { gte: new Date(dayStr + 'T00:00:00Z'), lt: new Date(dayStr + 'T23:59:59Z') } },
    });
    tripsPerDay.push({ date: dayStr, trips: count });
  }

  res.json({
    success: true,
    data: {
      summary: { totalUsers, passengers, drivers, operators, totalBuses, activeBuses, totalRoutes, activeRoutes, activeSos, openLostFound, totalTrips },
      usersPerDay,
      tripsPerDay,
    },
  });
};

export const getSystemSettings = async (req: Request, res: Response) => {
  const settings = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  res.json({ success: true, data: settings }); // returns array of {key, value}
};

export const updateSystemSetting = async (req: Request, res: Response) => {
  const { key } = req.params;
  const { value } = req.body;
  if (value === undefined) throw new AppError('value is required', 400);
  const setting = await prisma.systemSetting.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });
  res.json({ success: true, data: setting });
};


export const updateSystemSettings = async (req: Request, res: Response) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') throw new AppError('Settings object required', 400);

  const updates = await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );

  res.json({ success: true, data: updates });
};

export const getTripsByUser = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const passenger = await prisma.passenger.findUnique({ where: { userId } });
  // Non-passenger roles (driver/operator/admin) don't have trips — return empty
  if (!passenger) {
    return res.json({ success: true, data: [] });
  }

  const trips = await prisma.trip.findMany({
    where: { passengerId: passenger.id },
    include: { route: { select: { name: true, startPoint: true, endPoint: true } }, bus: { select: { name: true, busNumber: true } } },
    orderBy: { startedAt: 'desc' },
    take: 20,
  });

  res.json({ success: true, data: trips });
};

export const createTrip = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const passenger = await prisma.passenger.findUnique({ where: { userId } });
  if (!passenger) throw new AppError('Passenger profile not found', 404);

  const { routeId, busId, source, destination, fare } = req.body;
  if (!routeId || !source || !destination) throw new AppError('routeId, source, destination are required', 400);

  const trip = await prisma.trip.create({
    data: {
      passengerId: passenger.id,
      userId,
      routeId,
      busId,
      source,
      destination,
      fare: fare || 0,
      status: 'ACTIVE',
    },
    include: { route: true, bus: true },
  });

  res.status(201).json({ success: true, data: trip });
};
