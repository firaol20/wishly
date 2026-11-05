import 'dotenv/config';
import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyMultipart from '@fastify/multipart';

import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { wishlistRoutes } from './routes/wishlists';
import { itemRoutes } from './routes/items';
import { aiRoutes } from './routes/ai';
import { statsRoutes } from './routes/stats';
import { pushRoutes } from './routes/push';
import { uploadRoutes } from './routes/upload';
import { setupReminderCron } from './utils/reminderCron';

const app = Fastify({
  logger: process.env.NODE_ENV === 'development' ? { level: 'info' } : false,
});

async function buildApp() {
  // Security
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false, // handled by frontend
  });

  // CORS — Supports local dev, custom production domains, and preview deploys
  await app.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174')
        .split(',')
        .map((u) => u.trim().replace(/\/$/, ''));

      const isAllowed =
        configuredOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.endsWith('.vercel.app');

      if (isAllowed) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Cookies
  await app.register(fastifyCookie, {
    secret: process.env.JWT_SECRET || 'cookie-secret',
  });

  // Rate limiting
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Multipart (file uploads — up to 10MB)
  await app.register(fastifyMultipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // API routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(userRoutes, { prefix: '/api/v1/users' });
  await app.register(wishlistRoutes, { prefix: '/api/v1/wishlists' });
  await app.register(itemRoutes, { prefix: '/api/v1' });
  await app.register(aiRoutes, { prefix: '/api/v1/ai' });
  await app.register(statsRoutes, { prefix: '/api/v1/stats' });
  await app.register(pushRoutes, { prefix: '/api/v1/push' });
  await app.register(uploadRoutes, { prefix: '/api/v1/upload' });

  // AI rate limit (stricter)
  app.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/api/v1/ai/')) {
      // Additional AI-specific rate limiting handled in route
    }
  });

  return app;
}

async function start() {
  try {
    const server = await buildApp();
    const port = parseInt(process.env.PORT || '3001', 10);

    await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Wishly API running on http://localhost:${port}`);

    // Start reminder cron job
    setupReminderCron();

    // Graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        await server.close();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export { buildApp };
