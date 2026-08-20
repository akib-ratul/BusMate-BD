import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export const calculateFare = async (req: Request, res: Response) => {
  const { routeId, source, destination, distance } = req.body;

  let fare: number;
  let routeInfo = null;
  let totalDistance = distance;

  if (routeId) {
    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new AppError('Route not found', 404);
    routeInfo = route;

    // Get settings for fare per km
    const farePerKmSetting = await prisma.systemSetting.findUnique({ where: { key: 'fare_per_km' } });
    const farePerKm = farePerKmSetting ? parseFloat(farePerKmSetting.value) : 2.5;

    // Check if partial trip (source/destination within route)
    if (source && destination) {
      const stops = Array.isArray(route.stops) ? route.stops : [];
      const stopsArr = stops as Array<{ name: string; order: number }>;

      const fromStop = stopsArr.find(s => s.name.toLowerCase().includes(source.toLowerCase()));
      const toStop = stopsArr.find(s => s.name.toLowerCase().includes(destination.toLowerCase()));

      if (fromStop && toStop) {
        const stopCount = Math.abs(toStop.order - fromStop.order);
        const segmentDistance = (stopCount / Math.max(stopsArr.length, 1)) * route.distance;
        totalDistance = segmentDistance;
        fare = Math.max(route.baseFare * 0.5, segmentDistance * farePerKm);
      } else {
        fare = route.baseFare;
        totalDistance = route.distance;
      }
    } else {
      fare = route.baseFare;
      totalDistance = route.distance;
    }
  } else if (distance) {
    const farePerKmSetting = await prisma.systemSetting.findUnique({ where: { key: 'fare_per_km' } });
    const farePerKm = farePerKmSetting ? parseFloat(farePerKmSetting.value) : 2.5;
    const minFareSetting = await prisma.systemSetting.findUnique({ where: { key: 'min_fare' } });
    const minFare = minFareSetting ? parseFloat(minFareSetting.value) : 10;
    fare = Math.max(minFare, parseFloat(distance) * farePerKm);
  } else {
    throw new AppError('routeId or distance is required', 400);
  }

  // Round to nearest integer taka
  fare = Math.round(fare);

  res.json({
    success: true,
    data: {
      fare,
      currency: 'BDT',
      source: source || routeInfo?.startPoint,
      destination: destination || routeInfo?.endPoint,
      distance: totalDistance,
      route: routeInfo ? { id: routeInfo.id, name: routeInfo.name } : null,
    },
  });
};
