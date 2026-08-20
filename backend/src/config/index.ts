import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'busmate-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  aiApiKey: process.env.AI_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10), // 5MB
  rateLimitWindowMs: 15 * 60 * 1000, // 15 min
  rateLimitMax: 100,
  authRateLimitMax: 10,
};
