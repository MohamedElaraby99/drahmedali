import express from 'express';
import {
  createAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  generateAutoAchievements,
  getAchievementStats,
  getTopStudents,
  bulkDeleteAchievements,
  exportAchievements
} from '../controllers/achievement.controller.js';

import { isLoggedIn, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (for logged-in users)
router.get('/', isLoggedIn, getAllAchievements);
router.get('/stats', isLoggedIn, getAchievementStats);
router.get('/top-students', isLoggedIn, getTopStudents);
router.get('/export', isLoggedIn, exportAchievements);
router.get('/:id', isLoggedIn, getAchievementById);

// Admin/Instructor routes
router.post('/', isLoggedIn, requireAdmin, createAchievement);
router.post('/generate-auto', isLoggedIn, requireAdmin, generateAutoAchievements);
router.put('/:id', isLoggedIn, requireAdmin, updateAchievement);
router.delete('/:id', isLoggedIn, requireAdmin, deleteAchievement);
router.delete('/bulk-delete', isLoggedIn, requireAdmin, bulkDeleteAchievements);

export default router;
