import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
});

export async function userRoutes(app: FastifyInstance) {
  // Get current user
  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    return reply.send({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  });

  // Update profile
  app.patch('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const result = updateProfileSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: result.data,
    });

    return reply.send({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatarUrl: updated.avatarUrl,
      bio: updated.bio,
    });
  });

  // Export user data (GDPR)
  app.get('/me/export', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;

    const data = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        wishlists: {
          include: { items: true },
        },
      },
    });

    reply.header('Content-Type', 'application/json');
    reply.header('Content-Disposition', 'attachment; filename="wishly-export.json"');
    return reply.send(data);
  });

  // Delete account
  app.delete('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;

    await prisma.user.delete({ where: { id: user.id } });
    reply.clearCookie('refreshToken', { path: '/' });

    return reply.send({ message: 'Account deleted successfully' });
  });
}
