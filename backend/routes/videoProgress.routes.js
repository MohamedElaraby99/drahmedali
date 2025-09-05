import express from "express";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";
import {
  getVideoProgress,
  updateVideoProgress,
  getCourseProgress,
  getVideoProgressForAllUsers,
  resetVideoProgress,
  getUserVideoTracking,
  getUserTrackingStats,
  getAllUsersProgressSummary
} from "../controllers/videoProgress.controller.js";

const router = express.Router();

// Get user's progress for all videos in a course
router.get("/course/:courseId", isLoggedIn, getCourseProgress);

// Get all users' progress for a specific video (admin only)
router.get("/admin/video/:videoId", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), getVideoProgressForAllUsers);

// Get all users' progress summary for admin dashboard
router.get("/admin/all-users", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), getAllUsersProgressSummary);

// Get or create video progress for a user
router.get("/:courseId/:videoId", isLoggedIn, getVideoProgress);

// Update video progress
router.put("/:courseId/:videoId", isLoggedIn, updateVideoProgress);

// Reset video progress
router.delete("/:videoId", isLoggedIn, resetVideoProgress);

// Get comprehensive user tracking data for all videos
router.get("/user/:userId/tracking", isLoggedIn, getUserVideoTracking);

// Get tracking statistics for a specific user
router.get("/user/:userId/stats", isLoggedIn, getUserTrackingStats);

export default router; 