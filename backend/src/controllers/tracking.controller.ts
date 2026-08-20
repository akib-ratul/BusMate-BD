import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { getIO } from '../sockets';

export const updateLocation = async (req: Request, res: Response) => {
  const { busId, lat, lng, timestamp } = req.body;
  if (!busId || lat === undefined || lng === undefined) {
    throw new AppError('busId, lat, lng are required', 400);
  }

  // Only the assigned driver can update location
  if (req.user?.role === 'DRIVER') {
    const driver = await prisma.driver.findUnique({ where: { userId: req.user.userId } });
    if (!driver || driver.busId !== busId) {
      throw new AppError('You are not assigned to this bus', 403);
    }
  }

  const bus = await prisma.bus.update({
    where: { id: busId },
    data: {
      currentLat: lat,
      currentLng: lng,
      lastUpdated: new Date(timestamp || Date.now()),
      status: 'ACTIVE',
    },
    include: { route: { select: { name: true, stops: true, distance: true } } },
  });

  // Calculate ETA for remaining route
  const eta = calculateETA(bus);

  // Broadcast via Socket.IO
  const io = getIO();
  io.to(`bus:${busId}`).emit('bus:location:update', {
    busId,
    lat,
    lng,
    timestamp: timestamp || new Date().toISOString(),
    eta,
    status: bus.status,
  });

  // Also broadcast to all-buses room
  io.to('buses:all').emit('bus:location:update', {
    busId,
    lat,
    lng,
    timestamp: timestamp || new Date().toISOString(),
    eta,
    status: bus.status,
  });

  res.json({ success: true, data: { busId, lat, lng, eta } });
};

export const getTrackingBuses = async (req: Request, res: Response) => {
  const buses = await prisma.bus.findMany({
    where: { currentLat: { not: null }, currentLng: { not: null } },
    select: {
      id: true,
      name: true,
      busNumber: true,
      currentLat: true,
      currentLng: true,
      lastUpdated: true,
      status: true,
      route: { select: { name: true, startPoint: true, endPoint: true } },
      crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 },
    },
  });
  res.json({ success: true, data: buses });
};

export const getTrackingBus = async (req: Request, res: Response) => {
  const bus = await prisma.bus.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      busNumber: true,
      currentLat: true,
      currentLng: true,
      lastUpdated: true,
      status: true,
      capacity: true,
      route: { select: { name: true, startPoint: true, endPoint: true, stops: true, distance: true } },
      driver: { include: { user: { select: { name: true } } } },
      crowdReports: { orderBy: { reportedAt: 'desc' }, take: 1 },
    },
  });
  if (!bus) throw new AppError('Bus not found', 404);

  const eta = calculateETA(bus as any);
  res.json({ success: true, data: { ...bus, eta } });
};

function calculateETA(bus: any): string | null {
  if (!bus.currentLat || !bus.currentLng || !bus.route) return null;

  try {
    const stops = Array.isArray(bus.route.stops) ? bus.route.stops : [];
    if (stops.length === 0) return null;

    // Find the next stop ahead of current position
    const lastStop = stops[stops.length - 1] as { lat: number; lng: number };
    const distanceToEnd = haversine(bus.currentLat, bus.currentLng, lastStop.lat, lastStop.lng);

    // Assume avg speed 20 km/h in Dhaka traffic
    const avgSpeedKmh = 20;
    const etaMinutes = Math.round((distanceToEnd / avgSpeedKmh) * 60);

    return `~${etaMinutes} min`;
  } catch {
    return null;
  }
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
