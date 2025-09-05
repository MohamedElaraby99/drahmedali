import express from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import { getUserAchievements } from '../controllers/achievements.controller.js';

const router = express.Router();

// Get user achievements for student report
router.get('/user/:userId', isLoggedIn, getUserAchievements);

export default router;
