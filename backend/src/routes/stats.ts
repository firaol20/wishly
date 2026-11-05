import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';

export async function statsRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [total, dreamCount, inProgressCount, livedItCount, livedItThisYear, upcoming, recentlyLived] =
      await Promise.all([
        prisma.wishItem.count({
          where: { wishlist: { userId: user.id } },
        }),
        prisma.wishItem.count({
          where: { wishlist: { userId: user.id }, status: 'DREAM' },
        }),
        prisma.wishItem.count({
          where: { wishlist: { userId: user.id }, status: 'IN_PROGRESS' },
        }),
        prisma.wishItem.count({
          where: { wishlist: { userId: user.id }, status: 'LIVED_IT' },
        }),
        prisma.wishItem.count({
          where: {
            wishlist: { userId: user.id },
            status: 'LIVED_IT',
            completedAt: { gte: startOfYear },
          },
        }),
        prisma.wishItem.findMany({
          where: {
            wishlist: { userId: user.id },
            targetDate: { gte: now, lte: nextWeek },
            status: { not: 'LIVED_IT' },
          },
          orderBy: { targetDate: 'asc' },
          take: 3,
          select: { id: true, title: true, targetDate: true, status: true, category: true },
        }),
        prisma.wishItem.findMany({
          where: {
            wishlist: { userId: user.id },
            status: 'LIVED_IT',
          },
          orderBy: { completedAt: 'desc' },
          take: 3,
          select: {
            id: true,
            title: true,
            completedAt: true,
            memoryImageUrl: true,
            category: true,
          },
        }),
      ]);

    return reply.send({
      totalWishes: total,
      dreamCount,
      inProgressCount,
      livedItCount,
      livedItThisYear,
      completionPercent: total > 0 ? Math.round((livedItCount / total) * 100) : 0,
      upcomingTargetDates: upcoming,
      recentlyLived,
    });
  });
}
