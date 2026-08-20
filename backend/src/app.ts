import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFound } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import routeRoutes from './routes/route.routes';
import busRoutes from './routes/bus.routes';
import trackingRoutes from './routes/tracking.routes';
import crowdRoutes from './routes/crowd.routes';
import fareRoutes from './routes/fare.routes';
import ratingRoutes from './routes/rating.routes';
import sosRoutes from './routes/sos.routes';
import lostFoundRoutes from './routes/lostFound.routes';
import notificationRoutes from './routes/notification.routes';
import analyticsRoutes from './routes/analytics.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — accept localhost dev + any onrender.com subdomain + explicit CLIENT_URL
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      config.nodeEnv === 'development' ||
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      origin.endsWith('.onrender.com') ||
      config.clientUrl.split(',').map(o => o.trim()).includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Global rate limit
app.use(rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'BusMate BD API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/fare', fareRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
