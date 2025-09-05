import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError as AppError } from "../utils/ApiError.js";
import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import LiveMeeting from "../models/liveMeeting.model.js";
import { getCairoNow, toCairoTime, getCairoStartOfDay, getCairoEndOfDay } from '../utils/timezone.js';
import upload from '../middleware/multer.middleware.js';
import sharp from 'sharp';
import jsQR from 'jsqr';

// @desc    Scan QR code and record attendance
// @route   POST /api/v1/attendance/scan-qr
// @access  Instructor/Admin
export const scanQRAttendance = asyncHandler(async (req, res, next) => {
  const { qrData, courseId, liveMeetingId, scanLocation, notes } = req.body;
  const scannedBy = req.user._id || req.user.id;

  // Validate QR data
  if (!qrData || typeof qrData !== 'object') {
    return next(new AppError('Invalid QR data', 400));
  }

  // Validate QR data structure
  const { userId, fullName, username, phoneNumber, email, role, timestamp, type } = qrData;
  
  // Updated validation to accept minimal QR data (userId OR phoneNumber required, fullName optional)
  if ((!userId && !phoneNumber) || type !== 'attendance') {
    return next(new AppError('QR data incomplete or invalid - user ID or phone number required', 400));
  }

  // Check if QR code is not too old (within 1 hour)
  // Only check timestamp if it exists in the QR data
  if (timestamp) {
    const qrTimestamp = toCairoTime(timestamp);
    const now = getCairoNow();
    const diffInMinutes = (now - qrTimestamp) / (1000 * 60);
    
    if (diffInMinutes > 60) {
      return next(new AppError('QR code expired, please generate a new one', 400));
    }
  }

  // Find the user from QR data using either userId OR phoneNumber
  let user = null;
  
  if (userId) {
    user = await User.findById(userId);
  }
  
  // If not found by userId, try to find by phone number
  if (!user && phoneNumber) {
    user = await User.findOne({ phoneNumber: phoneNumber });
  }
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Verify QR data matches user data (only check available fields)
  const userIdMatches = !userId || user._id.toString() === userId;
  const phoneMatches = !phoneNumber || user.phoneNumber === phoneNumber;
  const nameMatches = !fullName || user.fullName === fullName; // Only check if fullName exists
  const usernameMatches = !username || user.username === username; // Only check if username exists
  
  if (!userIdMatches || !phoneMatches || !nameMatches || !usernameMatches) {
    return next(new AppError('QR data does not match user data', 400));
  }

  // Determine attendance type and validate course/meeting if provided
  let attendanceType = 'general';
  let course = null;
  let liveMeeting = null;

  if (courseId) {
    course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    attendanceType = 'course';
  }

  if (liveMeetingId) {
    liveMeeting = await LiveMeeting.findById(liveMeetingId);
    if (!liveMeeting) {
      return next(new AppError('Live meeting not found', 404));
    }
    attendanceType = 'live_meeting';
  }

  // Check for duplicate attendance
  const todayStart = getCairoStartOfDay();
  const todayEnd = getCairoEndOfDay();

  const existingAttendance = await Attendance.findOne({
    user: user._id, // Use the found user's ID
    attendanceDate: {
      $gte: todayStart,
      $lte: todayEnd
    },
    isValid: true,
    ...(courseId && { course: courseId }),
    ...(liveMeetingId && { liveMeeting: liveMeetingId })
  });

  if (existingAttendance) {
    return next(new AppError('Attendance already recorded for today', 400));
  }

  // Create attendance record
  const attendance = await Attendance.create({
    user: user._id, // Use the found user's ID
    course: courseId || null,
    liveMeeting: liveMeetingId || null,
    attendanceType,
    scannedBy,
    scanLocation: scanLocation || null,
    scanMethod: 'qr_code',
    qrData,
    status: 'present',
    notes: notes || null,
    attendanceDate: getCairoNow()
  });

  // Populate the attendance record
  await attendance.populate([
    { path: 'user', select: 'fullName username phoneNumber email' },
    { path: 'scannedBy', select: 'fullName username' },
    { path: 'course', select: 'title' },
    { path: 'liveMeeting', select: 'title scheduledDate' }
  ]);

  res.status(201).json({
    success: true,
    message: 'تم تسجيل الحضور بنجاح',
    data: {
      attendance,
      user: {
        fullName: user.fullName,
        username: user.username,
        phoneNumber: user.phoneNumber,
        email: user.email
      }
    }
  });
});

// @desc    Take attendance by phone number and user ID
// @route   POST /api/v1/attendance/take-by-phone
// @access  Instructor/Admin
export const takeAttendanceByPhone = asyncHandler(async (req, res, next) => {
  const { phoneNumber, userId, courseId, liveMeetingId, scanLocation, notes, status = 'present' } = req.body;
  const scannedBy = req.user._id || req.user.id;

  // Validate that at least phone number or userId is provided
  if (!phoneNumber && !userId) {
    return next(new AppError('Phone number or user ID is required', 400));
  }

  // Find the user by userId, username, phone number, or student ID
  let user = null;
  
  if (userId) {
    // Try to find by MongoDB ObjectId first
    if (/^[a-f\d]{24}$/i.test(userId)) {
      user = await User.findById(userId);
    }
    
    // If not found by ObjectId, try username or studentId
    if (!user) {
      user = await User.findOne({ 
        $or: [
          { username: userId },
          { studentId: userId }
        ]
      });
    }
  }
  
  // If not found by userId methods, try to find by phone number
  if (!user && phoneNumber) {
    user = await User.findOne({ phoneNumber: phoneNumber });
  }
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Cross-verify if both phoneNumber and userId are provided
  if (phoneNumber && userId) {
    if (user.phoneNumber !== phoneNumber) {
      return next(new AppError('Phone number does not match user ID', 400));
    }
  }

  // Determine attendance type and validate course/meeting if provided
  let attendanceType = 'general';
  let course = null;
  let liveMeeting = null;

  if (courseId) {
    course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    attendanceType = 'course';
  }

  if (liveMeetingId) {
    liveMeeting = await LiveMeeting.findById(liveMeetingId);
    if (!liveMeeting) {
      return next(new AppError('Live meeting not found', 404));
    }
    attendanceType = 'live_meeting';
  }

  // Check for duplicate attendance
  const todayStart = getCairoStartOfDay();
  const todayEnd = getCairoEndOfDay();

  const existingAttendance = await Attendance.findOne({
    user: user._id,
    attendanceDate: {
      $gte: todayStart,
      $lte: todayEnd
    },
    isValid: true,
    ...(courseId && { course: courseId }),
    ...(liveMeetingId && { liveMeeting: liveMeetingId })
  });

  if (existingAttendance) {
    return next(new AppError('Attendance already recorded for today', 400));
  }

  // Create attendance record
  const attendance = await Attendance.create({
    user: user._id,
    course: courseId || null,
    liveMeeting: liveMeetingId || null,
    attendanceType,
    scannedBy,
    scanLocation: scanLocation || null,
    scanMethod: 'manual',
    qrData: {
      userId: user._id,
      fullName: user.fullName,
      username: user.username,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      timestamp: getCairoNow(),
      type: 'attendance',
      method: 'phone_and_id'
    },
    status,
    notes: notes || null,
    attendanceDate: getCairoNow()
  });

  // Populate the attendance record
  await attendance.populate([
    { path: 'user', select: 'fullName username phoneNumber email' },
    { path: 'scannedBy', select: 'fullName username' },
    { path: 'course', select: 'title' },
    { path: 'liveMeeting', select: 'title scheduledDate' }
  ]);

  res.status(201).json({
    success: true,
    message: 'تم تسجيل الحضور بنجاح باستخدام رقم الهاتف والهوية',
    data: {
      attendance,
      user: {
        fullName: user.fullName,
        username: user.username,
        phoneNumber: user.phoneNumber,
        email: user.email
      },
      method: 'phone_and_id_verification'
    }
  });
});

// @desc    Get attendance records for a user
// @route   GET /api/v1/attendance/user/:userId
// @access  User (own records) / Admin/Instructor
export const getUserAttendance = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const requestingUser = req.user._id || req.user.id;
  const requestingUserRole = req.user.role;

  // Check authorization
  if (userId !== requestingUser.toString() && !['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(requestingUserRole)) {
    return next(new AppError('Access denied', 403));
  }

  const { page = 1, limit = 10, startDate, endDate, attendanceType, status } = req.query;

  // Build query
  const query = { user: userId, isValid: true };

  if (startDate && endDate) {
    query.attendanceDate = {
      $gte: toCairoTime(startDate),
      $lte: toCairoTime(endDate)
    };
  }

  if (attendanceType) {
    query.attendanceType = attendanceType;
  }

  if (status) {
    query.status = status;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { attendanceDate: -1 },
    populate: [
      { path: 'scannedBy', select: 'fullName username' },
      { path: 'course', select: 'title' },
      { path: 'liveMeeting', select: 'title scheduledDate' }
    ]
  };

  const attendance = await Attendance.paginate(query, options);

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Get attendance statistics for a user
// @route   GET /api/v1/attendance/user/:userId/stats
// @access  User (own stats) / Admin/Instructor
export const getUserAttendanceStats = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const requestingUser = req.user._id || req.user.id;
  const requestingUserRole = req.user.role;

  // Check authorization
  if (userId !== requestingUser.toString() && !['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(requestingUserRole)) {
    return next(new AppError('Access denied', 403));
  }

  const { startDate, endDate } = req.query;

  const stats = await Attendance.getAttendanceStats(userId, startDate, endDate);

  // Calculate attendance rate
  const startCairo = startDate ? toCairoTime(startDate) : null;
  const endCairo = endDate ? toCairoTime(endDate) : null;
  const totalDays = startCairo && endCairo ? 
    Math.ceil((endCairo - startCairo) / (1000 * 60 * 60 * 24)) : 30;
  const attendanceRate = totalDays > 0 ? Math.round((stats.totalAttendance / totalDays) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      ...stats,
      attendanceRate,
      totalDays
    }
  });
});

// @desc    Get all attendance records (Admin/Instructor only)
// @route   GET /api/v1/attendance
// @access  Admin/Instructor
export const getAllAttendance = asyncHandler(async (req, res, next) => {
  const requestingUserRole = req.user.role;

  if (!['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(requestingUserRole)) {
    return next(new AppError('Access denied', 403));
  }

  const { 
    page = 1, 
    limit = 10, 
    startDate, 
    endDate, 
    attendanceType, 
    status, 
    userId, 
    courseId, 
    liveMeetingId 
  } = req.query;

  // Build query
  const query = { isValid: true };

  if (startDate && endDate) {
    query.attendanceDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (attendanceType) {
    query.attendanceType = attendanceType;
  }

  if (status) {
    query.status = status;
  }

  if (userId) {
    query.user = userId;
  }

  if (courseId) {
    query.course = courseId;
  }

  if (liveMeetingId) {
    query.liveMeeting = liveMeetingId;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { attendanceDate: -1 },
    populate: [
      { path: 'user', select: 'fullName username phoneNumber email' },
      { path: 'scannedBy', select: 'fullName username' },
      { path: 'course', select: 'title' },
      { path: 'liveMeeting', select: 'title scheduledDate' }
    ]
  };

  const attendance = await Attendance.paginate(query, options);

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Update attendance record
// @route   PUT /api/v1/attendance/:id
// @access  Admin/Instructor
export const updateAttendance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const requestingUserRole = req.user.role;

  if (!['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(requestingUserRole)) {
    return next(new AppError('غير مصرح لك بتعديل هذه البيانات', 403));
  }

  const { status, notes } = req.body;

  const attendance = await Attendance.findById(id);
  if (!attendance) {
    return next(new AppError('سجل الحضور غير موجود', 404));
  }

  if (status) {
    attendance.status = status;
  }

  if (notes !== undefined) {
    attendance.notes = notes;
  }

  await attendance.save();

  await attendance.populate([
    { path: 'user', select: 'fullName username phoneNumber email' },
    { path: 'scannedBy', select: 'fullName username' },
    { path: 'course', select: 'title' },
    { path: 'liveMeeting', select: 'title scheduledDate' }
  ]);

  res.status(200).json({
    success: true,
    message: 'تم تحديث سجل الحضور بنجاح',
    data: attendance
  });
});

// @desc    Delete attendance record
// @route   DELETE /api/v1/attendance/:id
// @access  Admin/Instructor
export const deleteAttendance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const requestingUserRole = req.user.role;

  if (!['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(requestingUserRole)) {
    return next(new AppError('غير مصرح لك بحذف هذه البيانات', 403));
  }

  const attendance = await Attendance.findById(id);
  if (!attendance) {
    return next(new AppError('سجل الحضور غير موجود', 404));
  }

  await Attendance.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'تم حذف سجل الحضور بنجاح'
  });
});

// @desc    Get attendance overview dashboard
// @route   GET /api/v1/attendance/dashboard
// @access  Admin/Instructor
export const getAttendanceDashboard = asyncHandler(async (req, res, next) => {
  const requestingUserRole = req.user.role;

  if (!['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(requestingUserRole)) {
    return next(new AppError('Access denied', 403));
  }

  const { startDate, endDate } = req.query;

  // Get date range
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  // Get overall statistics
  const overallStats = await Attendance.aggregate([
    {
      $match: {
        attendanceDate: { $gte: start, $lte: end },
        isValid: true
      }
    },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        lateCount: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
        absentCount: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
        uniqueUsers: { $addToSet: "$user" }
      }
    },
    {
      $project: {
        totalRecords: 1,
        presentCount: 1,
        lateCount: 1,
        absentCount: 1,
        uniqueUserCount: { $size: "$uniqueUsers" }
      }
    }
  ]);

  // Get daily attendance trends
  const dailyTrends = await Attendance.aggregate([
    {
      $match: {
        attendanceDate: { $gte: start, $lte: end },
        isValid: true
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$attendanceDate" }
        },
        count: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get attendance by type
  const attendanceByType = await Attendance.aggregate([
    {
      $match: {
        attendanceDate: { $gte: start, $lte: end },
        isValid: true
      }
    },
    {
      $group: {
        _id: "$attendanceType",
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overallStats: overallStats[0] || {
        totalRecords: 0,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        uniqueUserCount: 0
      },
      dailyTrends,
      attendanceByType
    }
  });
});

// @desc    Get attendance records for a group
// @route   GET /api/v1/attendance/group/:groupId
// @access  Admin/Instructor
export const getGroupAttendance = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const requestingUserRole = req.user.role;

  if (!['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(requestingUserRole)) {
    return next(new AppError('Access denied', 403));
  }

  const { page = 1, limit = 50, startDate, endDate, status } = req.query;

  // First, find all users in the group
  const Group = (await import('../models/group.model.js')).default;
  const group = await Group.findById(groupId).populate('students', '_id');
  
  if (!group) {
    return next(new AppError('Group not found', 404));
  }

  const studentIds = group.students.map(student => student._id);

  // Build query for attendance records
  const query = { 
    user: { $in: studentIds }, 
    isValid: true 
  };

  // Add date range filter
  if (startDate && endDate) {
    query.attendanceDate = {
      $gte: toCairoTime(startDate),
      $lte: toCairoTime(endDate)
    };
  } else {
    // Default to current month if no date range provided
    const now = getCairoNow();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    query.attendanceDate = {
      $gte: startOfMonth,
      $lte: endOfMonth
    };
  }

  if (status) {
    query.status = status;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { attendanceDate: -1 },
    populate: [
      { path: 'user', select: 'fullName username phoneNumber email' },
      { path: 'scannedBy', select: 'fullName username' },
      { path: 'course', select: 'title' },
      { path: 'liveMeeting', select: 'title scheduledDate' }
    ]
  };

  const attendance = await Attendance.paginate(query, options);

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Analyze captured photo to extract user info and mark attendance
// @route   POST /api/v1/attendance/analyze-photo
// @access  Admin/Instructor
export const analyzePhotoAttendance = [
  upload.single('image'),
  asyncHandler(async (req, res, next) => {
    const scannedBy = req.user._id || req.user.id;
    const { courseId, liveMeetingId, scanLocation, notes } = req.body;
    if (!req.file) {
      return next(new AppError('No image provided', 400));
    }

    // Read and decode image into raw RGBA buffer
    const img = sharp(req.file.path);
    const metadata = await img.metadata();
    const { width, height } = metadata;
    if (!width || !height) {
      return next(new AppError('Invalid image', 400));
    }
    const raw = await img.ensureAlpha().raw().toBuffer();

    // jsQR expects Uint8ClampedArray
    const clamped = new Uint8ClampedArray(raw.buffer, raw.byteOffset, raw.byteLength);
    const code = jsQR(clamped, width, height, { inversionAttempts: 'attemptBoth' });

    if (!code || !code.data) {
      return next(new AppError('No QR code detected in image', 400));
    }

    let parsed = null;
    try { parsed = JSON.parse(code.data); } catch { parsed = null; }

    // Normalize output to { userId?, phoneNumber?, type: 'attendance' }
    const hex24 = /^[a-f\d]{24}$/i;
    const phoneRe = /(01\d{9})/; // Egyptian 11-digit starting with 01
    let out = { type: 'attendance' };

    if (parsed && typeof parsed === 'object') {
      if (parsed.userId && hex24.test(parsed.userId)) out.userId = parsed.userId;
      if (parsed.phoneNumber) out.phoneNumber = String(parsed.phoneNumber);
    } else {
      // Try to derive from raw text
      const raw = code.data.trim();
      if (hex24.test(raw)) {
        out.userId = raw;
      } else {
        const m = raw.match(hex24) || raw.match(phoneRe);
        if (m) {
          if (hex24.test(m[0])) out.userId = m[0];
          else if (phoneRe.test(m[0])) out.phoneNumber = m[0];
        }
      }
    }

    if (!out.userId && !out.phoneNumber) {
      return next(new AppError('QR decoded but missing userId/phoneNumber', 400));
    }

    return res.status(200).json({
      success: true,
      message: 'QR decoded successfully',
      data: { qrData: out }
    });
  })
];
