import express from 'express';
import {
  getCourseNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/courseNotification.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(isLoggedIn);

// Get course notifications for logged-in user
router.get('/notifications', getCourseNotifications);

// Mark specific notification as read
router.patch('/notifications/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.patch('/notifications/read-all', markAllNotificationsAsRead);

export default router;
