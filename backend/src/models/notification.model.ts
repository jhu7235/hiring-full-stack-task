// NOTIFICATIONS_REVIEW: I don't see Notification in the prisma client, is this imported correctly? MEDIUM
import { Notification, prisma } from '$prisma/client';

// Added during seed funding round when we were moving fast
// NOTIFICATIONS_REVIEW: This code is not used anymore. You can delete this file. LOW
// TODO: Refactor to service pattern
export class NotificationModel {
  static async markAsRead(notification: Notification) {
    return prisma.notification.update({
      where: { id: notification.id },
      data: { readAt: new Date() },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        readAt: null
      },
      data: { readAt: new Date() },
    });
  }
}
