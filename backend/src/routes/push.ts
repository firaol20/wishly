import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function pushRoutes(app: FastifyInstance) {
  // Get VAPID public key
  app.get('/vapid-key', async (request, reply) => {
    return reply.send({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
  });

  // Subscribe to push notifications
  app.post('/subscribe', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const result = subscribeSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error' });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: result.data.endpoint },
      update: {
        p256dh: result.data.keys.p256dh,
        auth: result.data.keys.auth,
      },
      create: {
        userId: user.id,
        endpoint: result.data.endpoint,
        p256dh: result.data.keys.p256dh,
        auth: result.data.keys.auth,
      },
    });

    return reply.status(201).send({ message: 'Subscribed' });
  });

  // Unsubscribe
  app.delete('/unsubscribe', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { endpoint } = request.body as { endpoint: string };

    await prisma.pushSubscription.deleteMany({
      where: { userId: user.id, endpoint },
    });

    return reply.send({ message: 'Unsubscribed' });
  });
}
