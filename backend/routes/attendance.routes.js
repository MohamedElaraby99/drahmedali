import express from "express";
import {
  scanQRAttendance,
  takeAttendanceByPhone,
  getUserAttendance,
  getUserAttendanceStats,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceDashboard,
  getGroupAttendance,
  analyzePhotoAttendance
} from "../controllers/attendance.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();

// @route   POST /api/v1/attendance/scan-qr
// @desc    Scan QR code and record attendance
// @access  Instructor/Admin
router.post("/scan-qr", isLoggedIn, scanQRAttendance);
// Capture image and analyze to extract attendance info
router.post("/analyze-photo", isLoggedIn, analyzePhotoAttendance);

// @route   POST /api/v1/attendance/take-by-phone
// @desc    Take attendance by phone number and user ID
// @access  Instructor/Admin
router.post("/take-by-phone", isLoggedIn, takeAttendanceByPhone);

// @route   GET /api/v1/attendance/user/:userId
// @desc    Get attendance records for a user
// @access  User (own records) / Admin/Instructor
router.get("/user/:userId", isLoggedIn, getUserAttendance);

// @route   GET /api/v1/attendance/user/:userId/stats
// @desc    Get attendance statistics for a user
// @access  User (own stats) / Admin/Instructor
router.get("/user/:userId/stats", isLoggedIn, getUserAttendanceStats);

// @route   GET /api/v1/attendance/group/:groupId
// @desc    Get attendance records for a group
// @access  Admin/Instructor
router.get("/group/:groupId", isLoggedIn, getGroupAttendance);

// @route   GET /api/v1/attendance
// @desc    Get all attendance records
// @access  Admin/Instructor
router.get("/", isLoggedIn, getAllAttendance);

// @route   GET /api/v1/attendance/dashboard
// @desc    Get attendance dashboard overview
// @access  Admin/Instructor
router.get("/dashboard", isLoggedIn, getAttendanceDashboard);

// @route   PUT /api/v1/attendance/:id
// @desc    Update attendance record
// @access  Admin/Instructor
router.put("/:id", isLoggedIn, updateAttendance);

// @route   DELETE /api/v1/attendance/:id
// @desc    Delete attendance record
// @access  Admin/Instructor
router.delete("/:id", isLoggedIn, deleteAttendance);

export default router;
