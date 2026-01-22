import { Router } from 'express';
import { NotificationsController } from '$controllers/notifications';

const router: Router = Router();
const controller = new NotificationsController();

// NOTIFICATIONS_REVIEW this is unused by the frontend, do we need it?
router.get('/', controller.getForUser);
router.get('/unread-count', controller.getUnreadCount);
// NOTIFICATIONS_REVIEW this is unused by the frontend, do we need it?
router.post('/', controller.create);
router.post('/mark-read/:id', controller.markAsRead);

export default router;
