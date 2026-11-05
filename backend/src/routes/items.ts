import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const createItemSchema = z.object({
  title: z.string().min(1).max(200),
  whyIWantThis: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  category: z.enum(['TRAVEL', 'HEALTH', 'CAREER', 'FAMILY', 'EDUCATION', 'FUN', 'OTHER']).optional(),
  tags: z.array(z.string()).max(10).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  targetDate: z.string().datetime().optional().nullable(),
});

const updateItemSchema = createItemSchema.partial();

const statusSchema = z.object({
  status: z.enum(['DREAM', 'IN_PROGRESS', 'LIVED_IT']),
});

const memorySchema = z.object({
  memoryNote: z.string().max(2000),
  memoryImageUrl: z.string().url().optional().or(z.literal('')),
});

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), sortOrder: z.number() })),
});

// Helper to verify wishlist ownership
async function verifyWishlistOwnership(wishlistId: string, userId: string) {
  return prisma.wishlist.findFirst({ where: { id: wishlistId, userId } });
}

export async function itemRoutes(app: FastifyInstance) {
  // List items in a wishlist (with filters)
  app.get('/wishlists/:wishlistId/items', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { wishlistId } = request.params as { wishlistId: string };
    const { status, category, priority, search } = request.query as Record<string, string>;

    const wishlist = await verifyWishlistOwnership(wishlistId, user.id);
    if (!wishlist) return reply.status(404).send({ error: 'Wishlist not found' });

    const items = await prisma.wishItem.findMany({
      where: {
        wishlistId,
        ...(status && { status: status as any }),
        ...(category && { category: category as any }),
        ...(priority && { priority: priority as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { tags: { has: search.toLowerCase() } },
          ],
        }),
      },
      orderBy: { sortOrder: 'asc' },
    });

    return reply.send(items);
  });

  // Create wish item
  app.post('/wishlists/:wishlistId/items', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { wishlistId } = request.params as { wishlistId: string };
    const result = createItemSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
    }

    const wishlist = await verifyWishlistOwnership(wishlistId, user.id);
    if (!wishlist) return reply.status(404).send({ error: 'Wishlist not found' });

    const count = await prisma.wishItem.count({ where: { wishlistId } });
    const item = await prisma.wishItem.create({
      data: {
        ...result.data,
        wishlistId,
        sortOrder: count,
        targetDate: result.data.targetDate ? new Date(result.data.targetDate) : null,
      },
    });

    return reply.status(201).send(item);
  });

  // Get wish item detail
  app.get('/items/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const item = await prisma.wishItem.findUnique({
      where: { id },
      include: { wishlist: { select: { userId: true, title: true } } },
    });

    if (!item || item.wishlist.userId !== user.id) {
      return reply.status(404).send({ error: 'Wish not found' });
    }

    return reply.send(item);
  });

  // Update wish item
  app.patch('/items/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };
    const result = updateItemSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
    }

    const item = await prisma.wishItem.findUnique({
      where: { id },
      include: { wishlist: { select: { userId: true } } },
    });

    if (!item || item.wishlist.userId !== user.id) {
      return reply.status(404).send({ error: 'Wish not found' });
    }

    const updated = await prisma.wishItem.update({
      where: { id },
      data: {
        ...result.data,
        targetDate: result.data.targetDate ? new Date(result.data.targetDate) : result.data.targetDate,
      },
    });

    return reply.send(updated);
  });

  // Delete wish item
  app.delete('/items/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const item = await prisma.wishItem.findUnique({
      where: { id },
      include: { wishlist: { select: { userId: true } } },
    });

    if (!item || item.wishlist.userId !== user.id) {
      return reply.status(404).send({ error: 'Wish not found' });
    }

    await prisma.wishItem.delete({ where: { id } });
    return reply.send({ message: 'Wish deleted' });
  });

  // Update wish status
  app.patch('/items/:id/status', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };
    const result = statusSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error' });
    }

    const item = await prisma.wishItem.findUnique({
      where: { id },
      include: { wishlist: { select: { userId: true } } },
    });

    if (!item || item.wishlist.userId !== user.id) {
      return reply.status(404).send({ error: 'Wish not found' });
    }

    const updated = await prisma.wishItem.update({
      where: { id },
      data: {
        status: result.data.status,
        completedAt: result.data.status === 'LIVED_IT' ? new Date() : null,
      },
    });

    return reply.send(updated);
  });

  // Add memory capsule
  app.post('/items/:id/memory', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };
    const result = memorySchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error', details: result.error.flatten() });
    }

    const item = await prisma.wishItem.findUnique({
      where: { id },
      include: { wishlist: { select: { userId: true } } },
    });

    if (!item || item.wishlist.userId !== user.id) {
      return reply.status(404).send({ error: 'Wish not found' });
    }

    const updated = await prisma.wishItem.update({
      where: { id },
      data: {
        memoryNote: result.data.memoryNote,
        memoryImageUrl: result.data.memoryImageUrl || null,
        status: 'LIVED_IT',
        completedAt: item.completedAt || new Date(),
      },
    });

    return reply.send(updated);
  });

  // Reorder items
  app.patch('/items/reorder', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const result = reorderSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: 'Validation error' });
    }

    // Verify ownership via join
    const itemIds = result.data.items.map(i => i.id);
    const items = await prisma.wishItem.findMany({
      where: { id: { in: itemIds } },
      include: { wishlist: { select: { userId: true } } },
    });

    const allOwned = items.every((i: any) => i.wishlist.userId === user.id);
    if (!allOwned) return reply.status(403).send({ error: 'Forbidden' });

    await Promise.all(
      result.data.items.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
        prisma.wishItem.update({ where: { id }, data: { sortOrder } })
      )
    );

    return reply.send({ message: 'Reordered' });
  });
}
