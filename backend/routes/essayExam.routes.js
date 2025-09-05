import express from "express";
import {
    createEssayExam,
    getEssayExams,
    getEssayExamById,
    submitEssayExam,
    getEssayExamSubmissions,
    gradeEssaySubmission,
    getUserEssaySubmissions,
    updateEssayExam,
    deleteEssayExam,
    getEssayExamStatistics
} from "../controllers/essayExam.controller.js";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create essay exam (Admin/Instructor only)
router.post("/create", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN", "INSTRUCTOR"), createEssayExam);

// Get essay exams for a lesson
router.get("/course/:courseId/lesson/:lessonId", isLoggedIn, getEssayExams);

// Get essay exam by ID
router.get("/:examId", isLoggedIn, getEssayExamById);

// Submit essay exam
router.post("/:examId/submit", isLoggedIn, submitEssayExam);

// Get essay exam submissions (Admin/Instructor only)
router.get("/:examId/submissions", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN", "INSTRUCTOR"), getEssayExamSubmissions);

// Grade essay submission (Admin/Instructor only)
router.post("/:examId/grade", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN", "INSTRUCTOR"), gradeEssaySubmission);

// Get user's essay submissions
router.get("/user/submissions", isLoggedIn, getUserEssaySubmissions);

// Update essay exam (Admin/Instructor only)
router.put("/:examId", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN", "INSTRUCTOR"), updateEssayExam);

// Delete essay exam (Admin/Instructor only)
router.delete("/:examId", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN", "INSTRUCTOR"), deleteEssayExam);

// Get essay exam statistics (Admin/Instructor only)
router.get("/course/:courseId/statistics", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN", "INSTRUCTOR"), getEssayExamStatistics);

export default router;
