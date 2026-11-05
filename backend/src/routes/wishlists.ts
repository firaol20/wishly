import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const createWishlistSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  visibility: z.enum(['PRIVATE', 'LINK']).optional(),
});

const updateWishlistSchema = createWishlistSchema.partial();

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), sortOrder: z.number() })),
});

export async function wishlistRoutes(app: FastifyInstance) {
  // List user's wishlists
  app.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const wishlists = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { _count: { select: { items: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return reply.send(wishlists);
  });

  // Create wishlist
  app.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const result = createWishlistSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
    }

    const count = await prisma.wishlist.count({ where: { userId: user.id } });
    const wishlist = await prisma.wishlist.create({
      data: {
        ...result.data,
        userId: user.id,
        sortOrder: count,
      },
    });

    return reply.status(201).send(wishlist);
  });

  // Get wishlist detail
  app.get('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const wishlist = await prisma.wishlist.findFirst({
      where: { id, userId: user.id },
      include: { _count: { select: { items: true } } },
    });

    if (!wishlist) return reply.status(404).send({ error: 'Wishlist not found' });
    return reply.send(wishlist);
  });

  // Update wishlist
  app.patch('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };
    const result = updateWishlistSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
    }

    const existing = await prisma.wishlist.findFirst({ where: { id, userId: user.id } });
    if (!existing) return reply.status(404).send({ error: 'Wishlist not found' });

    // Generate share token if visibility is being set to LINK
    let shareToken = existing.shareToken;
    if (result.data.visibility === 'LINK' && !shareToken) {
      shareToken = uuidv4();
    }

    const updated = await prisma.wishlist.update({
      where: { id },
      data: { ...result.data, shareToken },
    });

    return reply.send(updated);
  });

  // Delete wishlist
  app.delete('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const existing = await prisma.wishlist.findFirst({ where: { id, userId: user.id } });
    if (!existing) return reply.status(404).send({ error: 'Wishlist not found' });

    await prisma.wishlist.delete({ where: { id } });
    return reply.send({ message: 'Wishlist deleted' });
  });

  // Reorder wishlists
  app.patch('/reorder', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const result = reorderSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error' });
    }

    await Promise.all(
      result.data.items.map(({ id, sortOrder }) =>
        prisma.wishlist.updateMany({
          where: { id, userId: user.id },
          data: { sortOrder },
        })
      )
    );

    return reply.send({ message: 'Reordered' });
  });

  // Public share view (no auth)
  app.get('/share/:token', async (request, reply) => {
    const { token } = request.params as { token: string };

    const wishlist = await prisma.wishlist.findFirst({
      where: { shareToken: token, visibility: 'LINK' },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        user: { select: { name: true, avatarUrl: true } },
      },
    });

    if (!wishlist) return reply.status(404).send({ error: 'Wishlist not found or not shared' });
    return reply.send(wishlist);
  });
}
