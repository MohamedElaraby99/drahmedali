import videoProgressModel from "../models/videoProgress.model.js";
import courseModel from "../models/course.model.js";
import userModel from "../models/user.model.js";
import AppError from "../utils/error.utils.js";
import mongoose from "mongoose";

// Get or create video progress for a user
const getVideoProgress = async (req, res, next) => {
  try {
    const { videoId, courseId } = req.params;
    const userId = req.user._id || req.user.id;
    
    console.log('📖 Get Video Progress Request:', {
      userId,
      videoId,
      courseId,
      userRole: req.user.role
    });

    // Validate course exists and user has access
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    // Find existing progress or create new one
    let progress = await videoProgressModel.findOne({ userId, videoId });
    
    if (!progress) {
      // Create new progress
      progress = await videoProgressModel.create({
        userId,
        videoId,
        courseId,
        currentTime: 0,
        duration: 0,
        progress: 0
      });
    }

    res.status(200).json({
      success: true,
      message: "Video progress retrieved",
      data: progress
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Update video progress with smart tracking and forward-only logic
const updateVideoProgress = async (req, res, next) => {
  try {
    const { videoId, courseId } = req.params;
    const { currentTime, duration, progress, watchTime, reachedPercentage } = req.body;
    const userId = req.user._id || req.user.id;
    
    // 🔒 SECURITY: Only track progress for users with USER role
    if (req.user.role !== 'USER') {
      return res.status(200).json({
        success: true,
        message: "Progress tracking disabled for non-user roles",
        data: null
      });
    }
    
    console.log('📊 Video Progress Update Request:', {
      userId,
      videoId,
      courseId,
      userRole: req.user.role,
      currentTime,
      duration,
      progress: `${progress}%`,
      watchTime,
      reachedPercentage
    });

    // Find existing progress
    let progressRecord = await videoProgressModel.findOne({ userId, videoId });
    
    if (!progressRecord) {
      // Create new progress record
      progressRecord = await videoProgressModel.create({
        userId,
        videoId,
        courseId,
        currentTime: Math.max(currentTime || 0, 0),
        duration: duration || 0,
        progress: Math.max(progress || 0, 0),
        totalWatchTime: Math.max(watchTime || 0, 0),
        reachedPercentages: []
      });
      
      console.log('✅ Created new progress record:', {
        userId,
        videoId,
        initialProgress: `${progressRecord.progress}%`,
        initialWatchTime: progressRecord.totalWatchTime
      });
    } else {
      console.log('📈 Existing progress found:', {
        currentProgress: `${progressRecord.progress}%`,
        currentWatchTime: progressRecord.totalWatchTime,
        newProgress: `${progress}%`,
        newWatchTime: watchTime
      });
      
      // 🚀 FORWARD-ONLY LOGIC: Progress can only move forward
      const newProgress = Math.max(progress || 0, progressRecord.progress || 0);
      const newCurrentTime = Math.max(currentTime || 0, progressRecord.currentTime || 0);
      const newTotalWatchTime = Math.max((progressRecord.totalWatchTime || 0) + (watchTime || 0), progressRecord.totalWatchTime || 0);
      
      // Log any protection that was applied
      if (newProgress > (progress || 0)) {
        console.log('🛡️ Progress Protection: Prevented regression from', `${progressRecord.progress}%`, 'to', `${progress}%`);
      }
      
      if (newCurrentTime > (currentTime || 0)) {
        console.log('🛡️ Time Protection: Prevented currentTime regression from', progressRecord.currentTime, 'to', currentTime);
      }
      
      // Update with forward-only values
      progressRecord.currentTime = newCurrentTime;
      progressRecord.progress = newProgress;
      progressRecord.totalWatchTime = newTotalWatchTime;
      
      console.log('📊 Applied Updates:', {
        progress: `${progressRecord.progress}% (was ${progress}%)`,
        currentTime: `${progressRecord.currentTime}s (was ${currentTime}s)`,
        totalWatchTime: `${progressRecord.totalWatchTime}s (added ${watchTime}s)`
      });
    }

    // Update duration if provided and valid
    if (duration !== undefined && duration > 0) {
      progressRecord.duration = Math.max(duration, progressRecord.duration || 0);
    }
    
    // Update last watched timestamp
    progressRecord.lastWatched = new Date();
    
    // ✅ COMPLETION LOGIC: Mark as completed if progress >= 90% AND has meaningful watch time
    const hasSignificantWatchTime = progressRecord.totalWatchTime >= Math.min(30, (progressRecord.duration || 0) * 0.5); // At least 30 seconds OR 50% of video duration
    if (progressRecord.progress >= 90 && hasSignificantWatchTime) {
      progressRecord.isCompleted = true;
      console.log('🎉 Video marked as completed:', {
        progress: `${progressRecord.progress}%`,
        watchTime: `${progressRecord.totalWatchTime}s`
      });
    }
    
    // 🎯 CHECKPOINT LOGIC: Add reached percentage if valid
    if (reachedPercentage && typeof reachedPercentage === 'number') {
      const currentProgressPercent = progressRecord.progress;
      
      // Only allow checkpoint if current progress supports it
      if (currentProgressPercent >= reachedPercentage - 2) { // Allow 2% tolerance
        const percentageExists = progressRecord.reachedPercentages.some(rp => rp.percentage === reachedPercentage);
        if (!percentageExists) {
          progressRecord.reachedPercentages.push({
            percentage: reachedPercentage,
            time: progressRecord.currentTime,
            reachedAt: new Date()
          });
          console.log('🎯 Checkpoint reached:', `${reachedPercentage}%`);
        }
      } else {
        console.log('⚠️ Invalid checkpoint:', {
          requestedCheckpoint: `${reachedPercentage}%`,
          currentProgress: `${currentProgressPercent}%`,
          reason: 'Checkpoint exceeds current progress'
        });
      }
    }
    
    await progressRecord.save();

    res.status(200).json({
      success: true,
      message: "Video progress updated with smart tracking",
      data: progressRecord
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get user's progress for all videos in a course
const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Validate courseId is a valid ObjectId
    if (!courseId || !/^[0-9a-fA-F]{24}$/.test(courseId)) {
      return next(new AppError("Invalid course ID format", 400));
    }

    const progress = await videoProgressModel.find({ userId, courseId })
      .populate('userId', 'fullName')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Course progress retrieved",
      data: progress
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get all users' progress for a specific video (for admin)
const getVideoProgressForAllUsers = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { role } = req.user;

    // Only admins can see all users' progress
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return next(new AppError("Unauthorized access", 403));
    }

    const progress = await videoProgressModel.find({ videoId })
      .populate('userId', 'fullName email')
      .sort({ lastWatched: -1 });

    // Transform the data to include user information
    const transformedProgress = progress.map(item => ({
      _id: item._id,
      userId: item.userId,
      videoId: item.videoId,
      courseId: item.courseId,
      currentTime: item.currentTime,
      duration: item.duration,
      progress: item.progress,
      reachedPercentages: item.reachedPercentages,
      isCompleted: item.isCompleted,
      totalWatchTime: item.totalWatchTime,
      lastWatched: item.lastWatched,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      user: {
        _id: item.userId._id,
        fullName: item.userId.fullName,
        email: item.userId.email
      }
    }));

    res.status(200).json({
      success: true,
      message: "Video progress for all users retrieved",
      data: transformedProgress
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Reset video progress (for admin or user)
const resetVideoProgress = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { role } = req.user;

    // Find progress to reset
    const progress = await videoProgressModel.findOne({ videoId });
    
    if (!progress) {
      return next(new AppError("Video progress not found", 404));
    }

    // Only allow reset if user owns the progress or is admin
    if (progress.userId.toString() !== userId && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return next(new AppError("Unauthorized access", 403));
    }

    // Reset progress
    progress.currentTime = 0;
    progress.progress = 0;
    progress.isCompleted = false;
    progress.checkpoints.forEach(checkpoint => {
      checkpoint.reached = false;
      checkpoint.reachedAt = null;
    });

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Video progress reset successfully",
      data: progress
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};



// 🎯 NEW: Get comprehensive user video tracking data
const getUserVideoTracking = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user._id || req.user.id;
    const requestingUserRole = req.user.role;
    
    // 🔒 SECURITY: Only allow users to see their own data or admins to see any data
    if (userId !== requestingUserId.toString() && requestingUserRole !== 'ADMIN' && requestingUserRole !== 'SUPER_ADMIN') {
      return next(new AppError("Unauthorized access to user tracking data", 403));
    }
    
    console.log('📊 Getting comprehensive tracking for user:', userId);
    
    // Helper function to find video title from course structure
    const findVideoTitle = (course, videoId) => {
      if (!course || !videoId) return null;
      
      // Search in direct lessons
      if (course.directLessons) {
        for (const lesson of course.directLessons) {
          if (lesson.videos) {
            const video = lesson.videos.find(v => v.url && v.url.includes(videoId));
            if (video) {
              return video.title || `فيديو من درس: ${lesson.title}`;
            }
          }
        }
      }
      
      // Search in units
      if (course.units) {
        for (const unit of course.units) {
          if (unit.lessons) {
            for (const lesson of unit.lessons) {
              if (lesson.videos) {
                const video = lesson.videos.find(v => v.url && v.url.includes(videoId));
                if (video) {
                  return video.title || `فيديو من درس: ${lesson.title}`;
                }
              }
            }
          }
        }
      }
      
      return null;
    };
    
    // Get all video progress for this user with course details
    const allProgress = await videoProgressModel.find({ userId })
      .populate({
        path: 'courseId',
        select: 'title description units directLessons',
        populate: [
          { path: 'instructor', select: 'name' },
          { path: 'stage', select: 'name' },
          { path: 'subject', select: 'name' }
        ]
      })
      .sort({ lastWatched: -1 });
    
    // Calculate comprehensive statistics
    const stats = {
      totalVideosWatched: allProgress.length,
      totalWatchTime: allProgress.reduce((sum, p) => sum + (p.totalWatchTime || 0), 0),
      completedVideos: allProgress.filter(p => p.isCompleted).length,
      averageProgress: allProgress.length > 0 ? 
        Math.round(allProgress.reduce((sum, p) => sum + (p.progress || 0), 0) / allProgress.length) : 0,
      totalCheckpoints: allProgress.reduce((sum, p) => sum + (p.reachedPercentages?.length || 0), 0),
      lastWatched: allProgress.length > 0 ? allProgress[0].lastWatched : null
    };
    
    // Group by course for better organization
    const courseGroups = {};
    allProgress.forEach(progress => {
      const courseId = progress.courseId?._id || 'unknown';
      const courseName = progress.courseId?.title || 'Unknown Course';
      
      if (!courseGroups[courseId]) {
        courseGroups[courseId] = {
          courseId,
          courseName,
          videos: [],
          courseStats: {
            totalVideos: 0,
            completedVideos: 0,
            totalWatchTime: 0,
            averageProgress: 0
          }
        };
      }
      
      // Find video title from course structure
      const videoTitle = findVideoTitle(progress.courseId, progress.videoId);
      
      courseGroups[courseId].videos.push({
        videoId: progress.videoId,
        videoTitle: videoTitle || `فيديو: ${progress.videoId}`,
        progress: progress.progress,
        currentTime: progress.currentTime,
        duration: progress.duration,
        totalWatchTime: progress.totalWatchTime,
        isCompleted: progress.isCompleted,
        checkpointsReached: progress.reachedPercentages?.length || 0,
        lastWatched: progress.lastWatched
      });
      
      // Update course stats
      const courseStats = courseGroups[courseId].courseStats;
      courseStats.totalVideos++;
      courseStats.totalWatchTime += progress.totalWatchTime || 0;
      if (progress.isCompleted) courseStats.completedVideos++;
    });
    
    // Calculate average progress for each course
    Object.values(courseGroups).forEach(course => {
      if (course.videos.length > 0) {
        course.courseStats.averageProgress = Math.round(
          course.videos.reduce((sum, v) => sum + v.progress, 0) / course.videos.length
        );
      }
    });
    
    // Process recent activity with video titles
    const recentActivityWithTitles = allProgress.slice(0, 10).map(progress => {
      const videoTitle = findVideoTitle(progress.courseId, progress.videoId);
      return {
        videoId: progress.videoId,
        videoTitle: videoTitle || `فيديو: ${progress.videoId}`,
        courseName: progress.courseId?.title || 'دورة غير محددة',
        courseId: progress.courseId?._id,
        progress: progress.progress,
        isCompleted: progress.isCompleted,
        totalWatchTime: progress.totalWatchTime,
        lastWatched: progress.lastWatched,
        createdAt: progress.createdAt
      };
    });

    res.status(200).json({
      success: true,
      message: "User video tracking data retrieved successfully",
      data: {
        userId,
        overallStats: stats,
        courseBreakdown: Object.values(courseGroups),
        recentActivity: recentActivityWithTitles // Last 10 videos watched with titles
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// 📈 NEW: Get advanced tracking statistics for a user
const getUserTrackingStats = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user._id || req.user.id;
    const requestingUserRole = req.user.role;
    
    // 🔒 SECURITY: Only allow users to see their own stats or admins to see any stats
    if (userId !== requestingUserId.toString() && requestingUserRole !== 'ADMIN') {
      return next(new AppError("Unauthorized access to user statistics", 403));
    }
    
    console.log('📈 Calculating advanced stats for user:', userId);
    
    // Get all video progress with additional aggregation
    const progressData = await videoProgressModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          completedVideos: { $sum: { $cond: ["$isCompleted", 1, 0] } },
          totalWatchTime: { $sum: "$totalWatchTime" },
          averageProgress: { $avg: "$progress" },
          maxProgress: { $max: "$progress" },
          totalCheckpoints: { $sum: { $size: { $ifNull: ["$reachedPercentages", []] } } },
          lastActivity: { $max: "$lastWatched" },
          firstActivity: { $min: "$createdAt" }
        }
      }
    ]);
    
    const stats = progressData[0] || {
      totalVideos: 0,
      completedVideos: 0,
      totalWatchTime: 0,
      averageProgress: 0,
      maxProgress: 0,
      totalCheckpoints: 0,
      lastActivity: null,
      firstActivity: null
    };
    
    // Calculate additional metrics
    const completionRate = stats.totalVideos > 0 ? 
      Math.round((stats.completedVideos / stats.totalVideos) * 100) : 0;
    
    const watchTimeHours = Math.round((stats.totalWatchTime / 3600) * 100) / 100;
    
    // Calculate learning streak (days with video activity)
    const recentProgress = await videoProgressModel.find({ userId })
      .sort({ lastWatched: -1 })
      .limit(30)
      .select('lastWatched');
    
    const uniqueDays = new Set(
      recentProgress.map(p => p.lastWatched.toISOString().split('T')[0])
    ).size;
    
    res.status(200).json({
      success: true,
      message: "User tracking statistics calculated successfully",
      data: {
        userId,
        summary: {
          totalVideosWatched: stats.totalVideos,
          completedVideos: stats.completedVideos,
          completionRate: `${completionRate}%`,
          totalWatchTimeHours: watchTimeHours,
          averageProgress: Math.round(stats.averageProgress || 0),
          maxProgress: stats.maxProgress || 0,
          totalCheckpointsReached: stats.totalCheckpoints,
          activeDaysLast30: uniqueDays,
          firstActivity: stats.firstActivity,
          lastActivity: stats.lastActivity
        },
        learningMetrics: {
          consistency: uniqueDays >= 7 ? 'High' : uniqueDays >= 3 ? 'Medium' : 'Low',
          engagement: completionRate >= 70 ? 'High' : completionRate >= 40 ? 'Medium' : 'Low',
          progressQuality: stats.averageProgress >= 75 ? 'Excellent' : 
                          stats.averageProgress >= 50 ? 'Good' : 'Needs Improvement'
        }
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// 📊 NEW: Get all users' progress summary for admin dashboard
const getAllUsersProgressSummary = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { page = 1, limit = 20, courseId, stageId, search, sortBy = 'lastWatched', sortOrder = 'desc' } = req.query;

    // Only admins can access this data
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return next(new AppError("Unauthorized access", 403));
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build match filter
    let matchFilter = {};
    if (courseId) {
      matchFilter.courseId = new mongoose.Types.ObjectId(courseId);
    }

    // Get aggregated user progress data
    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$user' },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$userId',
          user: { $first: '$user' },
          totalVideosWatched: { $sum: 1 },
          completedVideos: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          totalWatchTime: { $sum: '$totalWatchTime' },
          averageProgress: { $avg: '$progress' },
          lastWatched: { $max: '$lastWatched' },
          courses: {
            $addToSet: {
              courseId: '$courseId',
              courseName: '$course.title',
              videosInCourse: 1,
              completedInCourse: { $cond: ['$isCompleted', 1, 0] }
            }
          },
          recentVideos: {
            $push: {
              videoId: '$videoId',
              progress: '$progress',
              isCompleted: '$isCompleted',
              lastWatched: '$lastWatched',
              courseName: '$course.title'
            }
          }
        }
      }
    ];

    // Filter out admin users - only show regular users
    pipeline.splice(3, 0, {
      $match: {
        'user.role': { $ne: 'ADMIN' }
      }
    });

    // Add search filter if provided
    if (search) {
      pipeline.splice(4, 0, {
        $match: {
          $or: [
            { 'user.fullName': { $regex: search, $options: 'i' } },
            { 'user.phoneNumber': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add stage filter if provided
    if (stageId) {
      pipeline.splice(search ? 5 : 4, 0, {
        $match: {
          'user.stage': new mongoose.Types.ObjectId(stageId)
        }
      });
    }

    // Add sorting and pagination
    pipeline.push(
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const usersProgress = await videoProgressModel.aggregate(pipeline);

    // Get total count for pagination
    const totalPipeline = [...pipeline.slice(0, -2)]; // Remove skip and limit
    totalPipeline.push({ $count: 'total' });
    const totalResult = await videoProgressModel.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Format the data
    const formattedData = usersProgress.map(item => ({
      userId: item._id,
      user: {
        _id: item.user._id,
        fullName: item.user.fullName,
        email: item.user.email,
        phoneNumber: item.user.phoneNumber,
        stage: item.user.stage,
        governorate: item.user.governorate
      },
      stats: {
        totalVideosWatched: item.totalVideosWatched,
        completedVideos: item.completedVideos,
        completionRate: item.totalVideosWatched > 0 ? 
          Math.round((item.completedVideos / item.totalVideosWatched) * 100) : 0,
        totalWatchTime: item.totalWatchTime,
        totalWatchTimeHours: Math.round((item.totalWatchTime / 3600) * 100) / 100,
        averageProgress: Math.round(item.averageProgress || 0),
        lastWatched: item.lastWatched,
        activeCourses: item.courses.length
      },
      recentActivity: item.recentVideos
        .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
        .slice(0, 5)
    }));

    // Calculate summary statistics
    const summaryStats = await videoProgressModel.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { 'user.role': { $ne: 'ADMIN' } } },
      {
        $group: {
          _id: null,
          totalUniqueUsers: { $addToSet: '$userId' },
          totalVideosWatched: { $sum: 1 },
          totalCompletedVideos: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          totalWatchTime: { $sum: '$totalWatchTime' },
          averageProgress: { $avg: '$progress' }
        }
      },
      {
        $project: {
          totalUniqueUsers: { $size: '$totalUniqueUsers' },
          totalVideosWatched: 1,
          totalCompletedVideos: 1,
          totalWatchTime: 1,
          averageProgress: 1,
          overallCompletionRate: {
            $cond: [
              { $gt: ['$totalVideosWatched', 0] },
              { $multiply: [{ $divide: ['$totalCompletedVideos', '$totalVideosWatched'] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    const stats = summaryStats[0] || {
      totalUniqueUsers: 0,
      totalVideosWatched: 0,
      totalCompletedVideos: 0,
      totalWatchTime: 0,
      averageProgress: 0,
      overallCompletionRate: 0
    };

    res.status(200).json({
      success: true,
      message: "All users progress summary retrieved successfully",
      data: formattedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        resultsPerPage: parseInt(limit)
      },
      summary: {
        totalUniqueUsers: stats.totalUniqueUsers,
        totalVideosWatched: stats.totalVideosWatched,
        totalCompletedVideos: stats.totalCompletedVideos,
        totalWatchTimeHours: Math.round((stats.totalWatchTime / 3600) * 100) / 100,
        averageProgress: Math.round(stats.averageProgress || 0),
        overallCompletionRate: Math.round(stats.overallCompletionRate || 0)
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export {
  getVideoProgress,
  updateVideoProgress,
  getCourseProgress,
  getVideoProgressForAllUsers,
  resetVideoProgress,
  getUserVideoTracking,
  getUserTrackingStats,
  getAllUsersProgressSummary
}; 