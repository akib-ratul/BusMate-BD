import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/prisma';

let io: SocketIOServer;

export function initSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.clientUrl.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for socket connections
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      // Allow unauthenticated for public bus tracking
      socket.data.user = null;
      return next();
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      socket.data.user = decoded;
      next();
    } catch {
      socket.data.user = null;
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`[Socket] Connected: ${socket.id} (${user?.email || 'anonymous'})`);

    // Join role-based rooms for authenticated users
    if (user) {
      socket.join(`user:${user.userId}`);
      socket.join(`role:${user.role.toLowerCase()}`);

      if (user.role === 'ADMIN') socket.join('room:admin');
      if (user.role === 'OPERATOR') socket.join('room:operator');
    }

    // Always join the public buses room
    socket.join('buses:all');

    // Passenger joins specific bus room
    socket.on('join:bus', (busId: string) => {
      socket.join(`bus:${busId}`);
      console.log(`[Socket] ${socket.id} joined bus:${busId}`);
    });

    socket.on('leave:bus', (busId: string) => {
      socket.leave(`bus:${busId}`);
    });

    // Driver sends location update
    socket.on('driver:location', async (data: { busId: string; lat: number; lng: number; timestamp?: string }) => {
      if (!user || user.role !== 'DRIVER') return;

      try {
        // Verify driver owns this bus
        const driver = await prisma.driver.findUnique({ where: { userId: user.userId } });
        if (!driver || driver.busId !== data.busId) return;

        const ts = data.timestamp || new Date().toISOString();

        // Update DB
        await prisma.bus.update({
          where: { id: data.busId },
          data: { currentLat: data.lat, currentLng: data.lng, lastUpdated: new Date(ts), status: 'ACTIVE' },
        });

        // Broadcast to bus room and all-buses room
        const payload = { busId: data.busId, lat: data.lat, lng: data.lng, timestamp: ts };
        io.to(`bus:${data.busId}`).emit('bus:location:update', payload);
        io.to('buses:all').emit('bus:location:update', payload);
      } catch (err) {
        console.error('[Socket] driver:location error:', err);
      }
    });

    // Driver updates bus status
    socket.on('driver:status', async (data: { busId: string; status: string }) => {
      if (!user || user.role !== 'DRIVER') return;
      try {
        const driver = await prisma.driver.findUnique({ where: { userId: user.userId } });
        if (!driver || driver.busId !== data.busId) return;

        const validStatuses = ['ACTIVE', 'INACTIVE'];
        if (!validStatuses.includes(data.status)) return;

        await prisma.bus.update({
          where: { id: data.busId },
          data: { status: data.status as any },
        });

        io.to(`bus:${data.busId}`).emit('bus:status:update', { busId: data.busId, status: data.status });
        io.to('buses:all').emit('bus:status:update', { busId: data.busId, status: data.status });
      } catch (err) {
        console.error('[Socket] driver:status error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
