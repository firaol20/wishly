import cron from 'node-cron';
import webpush from 'web-push';
import { prisma } from './prisma';

export function setupReminderCron() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('VAPID keys not configured — push reminders disabled');
    return;
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@wishly.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // Run daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running reminder cron job...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

    const wishes = await prisma.wishItem.findMany({
      where: {
        targetDate: { gte: tomorrowStart, lte: tomorrowEnd },
        status: { not: 'LIVED_IT' },
      },
      include: {
        wishlist: {
          include: {
            user: { include: { pushSubscriptions: true } },
          },
        },
      },
    });

    for (const wish of wishes) {
      const subscriptions = wish.wishlist.user.pushSubscriptions;
      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({
              title: '✨ Your dream is almost here!',
              body: `Tomorrow is the day for: "${wish.title}"`,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
            })
          );
        } catch (error) {
          console.error(`Failed to send push to ${sub.endpoint}:`, error);
          // Remove invalid subscription
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    }

    console.log(`Sent reminders for ${wishes.length} wishes`);
  });
}
