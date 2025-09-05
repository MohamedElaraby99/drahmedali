import express from 'express';
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import {
    getAllExamResults,
    getExamResultsStats,
    getExamResultById,
    exportExamResults,
    getExamResults,
    getUserExamHistory,
    getUserExamResults,
    getExamStatistics,
    searchExamResults
} from '../controllers/examResults.controller.js';

const router = express.Router();

// Public routes (no admin required)
router.get("/user/:userId/results", isLoggedIn, getUserExamResults);

// All other routes require admin authentication
router.use(isLoggedIn);
router.use(authorisedRoles('ADMIN', 'SUPER_ADMIN'));

// Get all exam results with filtering and pagination
router.get('/', getAllExamResults);

// Export exam results to CSV
router.get('/export', exportExamResults);

// Get exam results statistics
router.get('/stats', getExamResultsStats);

// Search exam results (admin only) - MUST come before /:id route
router.get("/search", searchExamResults);

// Get exam results statistics
router.get("/statistics", getExamStatistics);

// Get user's exam history
router.get("/history", isLoggedIn, getUserExamHistory);


// Get exam results for a specific lesson
router.get("/:courseId/:lessonId", isLoggedIn, getExamResults);

// Get specific exam result by ID - MUST come last
router.get('/:id', getExamResultById);

export default router;
