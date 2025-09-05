import express from "express";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";
import {
    takeTrainingExam,
    takeFinalExam,
    getExamResults,
    getUserExamHistory,
    getExamStatistics,
    checkExamTaken,
    clearExamAttempt
} from "../controllers/exam.controller.js";

const router = express.Router();

// Take training exam
router.post("/training", isLoggedIn, takeTrainingExam);

// Take final exam
router.post("/final", isLoggedIn, takeFinalExam);

// Get exam results for a specific lesson
router.get("/results/:courseId/:lessonId", isLoggedIn, getExamResults);

// Get user's exam history
router.get("/history", isLoggedIn, getUserExamHistory);

// Check if user has taken an exam
router.get("/check/:courseId/:lessonId/:examType", isLoggedIn, checkExamTaken);

// Clear exam attempt for a specific user and exam
router.delete("/clear/:courseId/:lessonId/:examId", isLoggedIn, clearExamAttempt);

// Get exam statistics (admin only)
router.get("/statistics/:courseId", isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN'), getExamStatistics);

export default router; 