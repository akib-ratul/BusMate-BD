import http from 'http';
import app from './app';
import { config } from './config';
import { initSocket } from './sockets';
import { prisma } from './config/prisma';

async function main() {
  // Test DB connection
  try {
    await prisma.$connect();
    console.log('[DB] Connected to PostgreSQL');
  } catch (err) {
    console.error('[DB] Failed to connect:', err);
    process.exit(1);
  }

  const server = http.createServer(app);

  // Initialize Socket.IO
  initSocket(server);
  console.log('[Socket] Socket.IO initialized');

  server.listen(config.port, () => {
    console.log(`[Server] BusMate BD API running on port ${config.port} (${config.nodeEnv})`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[Server] ${signal} received. Shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('[Server] Shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch(err => {
  console.error('[Fatal]', err);
  process.exit(1);
});
