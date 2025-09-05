import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Achievement from '../models/achievement.model.js';
import OfflineGrade from '../models/offlineGrade.model.js';
import Attendance from '../models/attendance.model.js';
import User from '../models/user.model.js';
import Group from '../models/group.model.js';

// @desc    Create a new achievement
// @route   POST /api/v1/achievements
// @access  Private (Admin/Instructor)
const createAchievement = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    studentId,
    points,
    maxPoints = 100,
    status = 'active',
    groupId,
    icon,
    validUntil
  } = req.body;

  // Validate student exists
  const student = await User.findById(studentId);
  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  // Validate group if provided
  if (groupId) {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(404, 'Group not found');
    }
  }

  // Create achievement
  const achievement = await Achievement.create({
    title,
    description,
    category,
    studentId,
    studentName: student.fullName,
    points,
    maxPoints,
    status,
    groupId,
    groupName: groupId ? (await Group.findById(groupId))?.name : undefined,
    icon,
    validUntil,
    uploadedBy: req.user._id,
    uploadedByName: req.user.fullName || req.user.email || 'مستخدم غير معروف'
  });

  res.status(201).json(
    new ApiResponse(201, achievement, 'Achievement created successfully')
  );
});

// @desc    Get all achievements with pagination and filters
// @route   GET /api/v1/achievements
// @access  Private
const getAllAchievements = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    status,
    studentId,
    groupId,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (studentId) filter.studentId = studentId;
  if (groupId) filter.groupId = groupId;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { studentName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const achievements = await Achievement.find(filter)
    .populate('studentId', 'fullName email')
    .populate('groupId', 'name')
    .populate('uploadedBy', 'fullName')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Achievement.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, {
      data: achievements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    }, 'تم جلب الإنجازات بنجاح')
  );
});

// @desc    Get achievement by ID
// @route   GET /api/v1/achievements/:id
// @access  Private
const getAchievementById = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id)
    .populate('studentId', 'fullName email')
    .populate('groupId', 'name')
    .populate('uploadedBy', 'fullName');

  if (!achievement) {
    throw new ApiError(404, 'الإنجاز غير موجود');
  }

  res.status(200).json(
    new ApiResponse(200, achievement, 'تم جلب الإنجاز بنجاح')
  );
});

// @desc    Update achievement
// @route   PUT /api/v1/achievements/:id
// @access  Private (Admin/Instructor)
const updateAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    throw new ApiError(404, 'الإنجاز غير موجود');
  }

  // Update achievement
  const updatedAchievement = await Achievement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('studentId', 'fullName email')
   .populate('groupId', 'name')
   .populate('uploadedBy', 'fullName');

  res.status(200).json(
    new ApiResponse(200, updatedAchievement, 'تم تحديث الإنجاز بنجاح')
  );
});

// @desc    Delete achievement
// @route   DELETE /api/v1/achievements/:id
// @access  Private (Admin/Instructor)
const deleteAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id);

  if (!achievement) {
    throw new ApiError(404, 'الإنجاز غير موجود');
  }

  await Achievement.findByIdAndDelete(req.params.id);

  res.status(200).json(
    new ApiResponse(200, null, 'تم حذف الإنجاز بنجاح')
  );
});

// @desc    Generate automatic achievements based on grades and attendance
// @route   POST /api/v1/achievements/generate-auto
// @access  Private (Admin/Instructor)
const generateAutoAchievements = asyncHandler(async (req, res) => {
  const { groupId, category = 'overall' } = req.body;

  // Get all students in the group
  const group = await Group.findById(groupId).populate('students');
  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  const generatedAchievements = [];

  for (const student of group.students) {
    // Calculate quiz performance
    const quizGrades = await OfflineGrade.find({
      studentId: student._id,
      groupId: groupId
    });

    let totalQuizScore = 0;
    let totalQuizCount = quizGrades.length;
    let averageQuizScore = 0;

    if (totalQuizCount > 0) {
      totalQuizScore = quizGrades.reduce((sum, grade) => sum + (grade.score || 0), 0);
      averageQuizScore = Math.round(totalQuizScore / totalQuizCount);
    }

    // Calculate attendance performance
    const attendanceRecords = await Attendance.find({
      studentId: student._id,
      groupId: groupId
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Calculate consecutive attendance
    let consecutiveDays = 0;
    let maxConsecutive = 0;
    let currentConsecutive = 0;

    for (let i = 0; i < attendanceRecords.length; i++) {
      if (attendanceRecords[i].status === 'present') {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }

    // Determine achievement based on performance
    let achievementTitle = '';
    let achievementDescription = '';
    let points = 0;
    let icon = '🏆';

    if (category === 'academic' || category === 'overall') {
      if (averageQuizScore >= 95) {
        achievementTitle = 'متفوق أكاديمياً';
        achievementDescription = 'حصل على أعلى الدرجات في جميع الاختبارات';
        points = 100;
        icon = '🥇';
      } else if (averageQuizScore >= 85) {
        achievementTitle = 'متميز أكاديمياً';
        achievementDescription = 'أداء ممتاز في الاختبارات';
        points = 85;
        icon = '🥈';
      } else if (averageQuizScore >= 75) {
        achievementTitle = 'جيد أكاديمياً';
        achievementDescription = 'أداء جيد في الاختبارات';
        points = 75;
        icon = '🥉';
      }
    }

    if (category === 'attendance' || category === 'overall') {
      if (attendanceRate >= 95) {
        achievementTitle = 'حضور مثالي';
        achievementDescription = 'حضور ممتاز بنسبة 95% أو أكثر';
        points = Math.max(points, 90);
        icon = '⭐';
      } else if (attendanceRate >= 85) {
        achievementTitle = 'حضور جيد جداً';
        achievementDescription = 'حضور جيد جداً بنسبة 85% أو أكثر';
        points = Math.max(points, 80);
        icon = '🌟';
      } else if (maxConsecutive >= 10) {
        achievementTitle = 'حضور متواصل';
        achievementDescription = `حضر ${maxConsecutive} أيام متتالية`;
        points = Math.max(points, 70);
        icon = '🔥';
      }
    }

    // Create achievement if criteria met
    if (achievementTitle && points > 0) {
      // Check if achievement already exists
      const existingAchievement = await Achievement.findOne({
        studentId: student._id,
        groupId: groupId,
        title: achievementTitle,
        category: category
      });

      if (!existingAchievement) {
        const achievement = await Achievement.create({
          title: achievementTitle,
          description: achievementDescription,
          category: category,
          studentId: student._id,
          studentName: student.fullName,
          points: points,
          maxPoints: 100,
          status: 'active',
          groupId: groupId,
          groupName: group.name,
          icon: icon,
          achievementType: 'auto_generated',
          uploadedBy: req.user._id,
          uploadedByName: req.user.fullName || req.user.email || 'مستخدم غير معروف',
          criteria: {
            totalQuizScore,
            totalQuizCount,
            averageQuizScore,
            attendanceRate,
            totalAttendanceDays: totalDays,
            consecutiveAttendanceDays: maxConsecutive
          }
        });

        generatedAchievements.push(achievement);
      }
    }
  }

  res.status(200).json(
    new ApiResponse(200, {
      generatedCount: generatedAchievements.length,
      achievements: generatedAchievements
    }, `تم إنشاء ${generatedAchievements.length} إنجاز تلقائياً`)
  );
});

// @desc    Get achievement statistics
// @route   GET /api/v1/achievements/stats
// @access  Private
const getAchievementStats = asyncHandler(async (req, res) => {
  const { groupId } = req.query;

  const filter = {};
  if (groupId) filter.groupId = groupId;

  const stats = await Achievement.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalAchievements: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        averagePoints: { $avg: '$points' },
        activeAchievements: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        categoryBreakdown: {
          $push: '$category'
        },
        levelBreakdown: {
          $push: '$level'
        }
      }
    }
  ]);

  // Calculate category and level counts
  const categoryCounts = {};
  const levelCounts = {};

  if (stats.length > 0) {
    stats[0].categoryBreakdown.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    stats[0].levelBreakdown.forEach(level => {
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });
  }

  const result = {
    totalAchievements: stats[0]?.totalAchievements || 0,
    totalPoints: stats[0]?.totalPoints || 0,
    averagePoints: Math.round(stats[0]?.averagePoints || 0),
    activeAchievements: stats[0]?.activeAchievements || 0,
    categoryBreakdown: categoryCounts,
    levelBreakdown: levelCounts
  };

  res.status(200).json(
    new ApiResponse(200, result, 'تم جلب إحصائيات الإنجازات بنجاح')
  );
});

// @desc    Get top performing students
// @route   GET /api/v1/achievements/top-students
// @access  Private
const getTopStudents = asyncHandler(async (req, res) => {
  const { groupId, limit = 10, category } = req.query;

  const filter = {};
  if (groupId) filter.groupId = groupId;
  if (category) filter.category = category;

  const topStudents = await Achievement.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$studentId',
        studentName: { $first: '$studentName' },
        totalAchievements: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        averagePoints: { $avg: '$points' },
        achievements: { $push: '$$ROOT' }
      }
    },
    {
      $sort: { totalPoints: -1 }
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, topStudents, 'تم جلب أفضل الطلاب بنجاح')
  );
});

// @desc    Bulk delete achievements
// @route   DELETE /api/v1/achievements/bulk-delete
// @access  Private (Admin)
const bulkDeleteAchievements = asyncHandler(async (req, res) => {
  const { achievementIds } = req.body;

  if (!achievementIds || !Array.isArray(achievementIds) || achievementIds.length === 0) {
    throw new ApiError(400, 'يجب تحديد معرفات الإنجازات المراد حذفها');
  }

  const result = await Achievement.deleteMany({
    _id: { $in: achievementIds }
  });

  res.status(200).json(
    new ApiResponse(200, { deletedCount: result.deletedCount }, `تم حذف ${result.deletedCount} إنجاز بنجاح`)
  );
});

// @desc    Export achievements to Excel
// @route   GET /api/v1/achievements/export
// @access  Private
const exportAchievements = asyncHandler(async (req, res) => {
  const { groupId, category, status } = req.query;

  const filter = {};
  if (groupId) filter.groupId = groupId;
  if (category) filter.category = category;
  if (status) filter.status = status;

  const achievements = await Achievement.find(filter)
    .populate('studentId', 'fullName email')
    .populate('groupId', 'name')
    .sort({ createdAt: -1 });

  // Format data for export
  const exportData = achievements.map(achievement => ({
    'عنوان الإنجاز': achievement.title,
    'الوصف': achievement.description,
    'الفئة': achievement.category,
    'اسم الطالب': achievement.studentName,
    'النقاط': achievement.points,
    'النسبة المئوية': `${achievement.percentage}%`,
    'المستوى': achievement.level,
    'الحالة': achievement.status,
    'تاريخ الإنجاز': achievement.awardedAt.toLocaleDateString('ar-EG'),
    'المجموعة': achievement.groupName || 'غير محدد',
    'تم إنشاؤه بواسطة': achievement.uploadedByName
  }));

  res.status(200).json(
    new ApiResponse(200, exportData, 'تم تصدير الإنجازات بنجاح')
  );
});

export {
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
};
