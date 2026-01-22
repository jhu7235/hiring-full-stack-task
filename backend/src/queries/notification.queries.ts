import { prisma } from '$prisma/client';

// DEPRECATED 
export class NotificationQueries {
  async getNotificationsForUser(userId: string) {
    // OLD PATTERN - No DTO mapping
    return prisma.notification.findMany({
      where: { userId },
    });
  }

  async getNotificationsWithDetailsForUser(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
    });
    for (const notification of notifications) {
      const user = await prisma.user.findUnique({
        where: { id: notification.userId },
      });
      (notification as any).user = user;
    }

    return notifications;
  }

  async getUnreadCountForUsers(userIds: string) {
    // NOTIFICATIONS_REVIEW this incomplete
    // TODO: Return count of unread notifications for the given userIds as a map
  }
}
