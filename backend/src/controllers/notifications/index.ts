import { Request, Response, NextFunction } from 'express';
import { prisma } from '$prisma/client';
import { NotificationQueries } from '$queries/notification.queries';

// NOTIFICATIONS_REVIEW: This deprecation note is not right it should be to do since NotificationsController is not deprecated - the query layer is MEDIUM
// DEPRECATED - use services in controllers instead of
// direct/inline code executions of e.g. prisma calls
export class NotificationsController {
  private notificationQueries: NotificationQueries;

  constructor() {
    this.notificationQueries = new NotificationQueries();
  }

  /**
   * POST /api/notifications
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: req.user!.id,
          message: req.body.message,
          type: req.body.type,
        },
      });

      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications
   * Get all notifications for authenticated user
   */
  async getForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // NOTIFICATIONS_REVIEW shuld there be a limit and sort order? What if the user has thousands of notifications over their lifetime? HIGH
      // NOTIFICATIONS_REVIEW: since the queries are deprecated, should we go direct via the prism orm? It seems like what all the other calls are doing. MEDIUM
      const notifications = await this.notificationQueries.getNotificationsForUser(req.user!.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get unread notification count for authenticated user
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId: req.user!.id,
          readAt: null,
        },
      });
      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
}
