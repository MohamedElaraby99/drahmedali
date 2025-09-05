import Course from '../models/course.model.js';
import AppError from '../utils/error.utils.js';
import { getCairoNow, toCairoTime } from '../utils/timezone.js';

import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// Create a new course
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, instructor, stage, subject } = req.body;
    if (!title || !instructor || !stage || !subject) {
      return res.status(400).json({ success: false, message: 'Title, instructor, stage, and subject are required' });
    }

    // Prepare course data
    const courseData = {
            title,
            description,
      instructor,
            stage,
      subject,
      units: [],
      directLessons: []
    };

    // Handle image upload if provided
    if (req.file) {
      try {
        console.log('📸 Processing course image upload:', req.file.filename);
        
        // Move file to uploads/courses directory
        const uploadsDir = path.join('uploads', 'courses');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const destPath = path.join(uploadsDir, req.file.filename);
        fs.renameSync(req.file.path, destPath);
        
        // Store local file path in database
        courseData.image = {
          public_id: req.file.filename,
          secure_url: `/uploads/courses/${req.file.filename}`
        };
        
        console.log('✅ Course image saved locally:', destPath);
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError);
        // Continue without image if upload fails
        
        // Clean up file even if upload fails
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.rmSync(`uploads/${req.file.filename}`);
        }
      }
    }

    const course = await Course.create(courseData);
    return res.status(201).json({ success: true, message: 'Course created', data: { course } });
            } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get all courses for admin (full data with content)
export const getAdminCourses = async (req, res, next) => {
  try {
    let query = {};
    
    // Handle filters from query parameters
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.instructor) {
      query.instructor = { $regex: req.query.instructor, $options: 'i' };
    }
    
    if (req.query.subject) {
      query.subject = { $regex: req.query.subject, $options: 'i' };
    }
    
    if (req.query.stage) {
      query.stage = { $regex: req.query.stage, $options: 'i' };
    }
    
    if (req.query.featured !== undefined && req.query.featured !== '') {
      query.featured = req.query.featured === 'true';
    }
    
    if (req.query.isPublished !== undefined && req.query.isPublished !== '') {
      query.isPublished = req.query.isPublished === 'true';
    }
    
    if (req.query.level) {
      query.level = req.query.level;
    }
    
    if (req.query.language) {
      query.language = req.query.language;
    }
    
    console.log('🎯 Admin courses query:', JSON.stringify(query, null, 2));
    
    const courses = await Course.find(query)
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'title');

    return res.status(200).json({ success: true, data: { courses } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get all courses (secure version for public listing)
export const getAllCourses = async (req, res, next) => {
  try {
    let query = {};
    
    console.log('getAllCourses called with user:', {
      hasUser: !!req.user,
      userId: req.user?.id,
      userStage: req.user?.stage,
      userStageName: req.user?.stageName
    });
    
    // If user is logged in and has a stage, filter courses by their stage
    if (req.user && req.user.stage) {
      query.stage = req.user.stage;
      console.log('🎯 Filtering courses by user stage:', req.user.stage, '(' + req.user.stageName + ')');
      
      // Stage filtering only (category field removed)
      console.log('🎯 Filtering courses by user stage only');
    } else {
      console.log('⚠️ No stage filtering applied - showing all courses');
      if (req.user && !req.user.stage) {
        console.log('User logged in but has no stage assigned');
      }
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'title')
      .select('-units.lessons.exams.questions.correctAnswer -units.lessons.trainings.questions.correctAnswer -directLessons.exams.questions.correctAnswer -directLessons.trainings.questions.correctAnswer -units.lessons.exams.userAttempts -units.lessons.trainings.userAttempts -directLessons.exams.userAttempts -directLessons.trainings.userAttempts');

    console.log('📊 Raw courses before processing:', courses.map(c => ({
      id: c._id,
      title: c.title,
      stage: c.stage?.name,
      stageId: c.stage?._id
    })));
    
    console.log('🎯 Final query used for filtering:', JSON.stringify(query, null, 2));
    console.log(`📚 Found ${courses.length} courses matching user's stage criteria`);

    // Check if any courses have invalid stage references
    const coursesWithMissingStages = courses.filter(c => !c.stage || !c.stage.name);
    if (coursesWithMissingStages.length > 0) {
      console.log('⚠️ Found courses with missing/invalid stage data:', coursesWithMissingStages.map(c => ({
        id: c._id,
        title: c.title,
        stageRef: c.stage
      })));
    }

    // Further filter sensitive data from nested structures
    const secureCourses = courses.map(course => {
      const courseObj = course.toObject();
      
      // Clean up units and lessons
      if (courseObj.units) {
        courseObj.units = courseObj.units.map(unit => ({
          ...unit,
          lessons: unit.lessons?.map(lesson => ({
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            price: lesson.price,
            videosCount: lesson.videos?.length || 0,
            pdfsCount: lesson.pdfs?.length || 0,
            examsCount: lesson.exams?.length || 0,
            trainingsCount: lesson.trainings?.length || 0
            // Exclude actual content for security
          })) || []
        }));
      }
      
      // Clean up direct lessons
      if (courseObj.directLessons) {
        courseObj.directLessons = courseObj.directLessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          price: lesson.price,
          videosCount: lesson.videos?.length || 0,
          pdfsCount: lesson.pdfs?.length || 0,
          examsCount: lesson.exams?.length || 0,
          trainingsCount: lesson.trainings?.length || 0
          // Exclude actual content for security
        }));
      }
      
      return courseObj;
    });

    console.log(`📚 Returning ${secureCourses.length} courses for user`, {
      userStage: req.user?.stage,
      coursesReturned: secureCourses.map(c => ({ 
        id: c._id, 
        title: c.title, 
        stage: c.stage?.name 
      }))
    });

    return res.status(200).json({ success: true, data: { courses: secureCourses } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Toggle course featured status
export const toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
    
    // Toggle featured status
    course.featured = !course.featured;
    await course.save();
    
    console.log(`🎯 Course ${course.title} ${course.featured ? 'featured' : 'unfeatured'}`);
    
    return res.status(200).json({ 
      success: true, 
      message: `Course ${course.featured ? 'featured' : 'unfeatured'} successfully`,
      data: { course }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get featured courses (secure version)
export const getFeaturedCourses = async (req, res, next) => {
  try {
    console.log('=== GET FEATURED COURSES ===');
    
    // Check if Course model is available
    if (!Course) {
      console.error('Course model not available');
      return res.status(500).json({
        success: false,
        message: 'Database model not available'
      });
    }
    
    let query = {};
    
    // Check if this route also needs stage filtering (based on how it's called)
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
        const User = (await import('../models/user.model.js')).default;
        const user = await User.findById(userDetails.id).populate('stage');
        if (user && user.stage) {
          query.stage = user.stage._id;
          console.log('🎯 Filtering featured courses by user stage:', user.stage.name);
          
          // Stage filtering only (category field removed)
          console.log('🎯 Filtering featured courses by user stage only');
        }
      } catch (error) {
        console.log('Optional auth failed for featured courses, showing all');
      }
    }
    
    console.log('Querying featured courses with query:', JSON.stringify(query, null, 2));
    const courses = await Course.find({ ...query, featured: true })
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'title')
      .limit(6);
      
    console.log('🎯 Featured courses query used for filtering:', JSON.stringify(query, null, 2));
    console.log('📚 Featured courses found:', courses.length);
    console.log('📚 Featured courses details:', courses.map(c => ({
      id: c._id,
      title: c.title,
      stage: c.stage?.name,

    })));

    // Create secure versions without sensitive data
    const secureCourses = courses.map(course => {
      const courseObj = course.toObject();
      
      // Remove sensitive lesson content
      if (courseObj.units) {
        courseObj.units = courseObj.units.map(unit => ({
          ...unit,
          lessons: unit.lessons?.map(lesson => ({
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            price: lesson.price,
            videosCount: lesson.videos?.length || 0,
            pdfsCount: lesson.pdfs?.length || 0,
            examsCount: lesson.exams?.length || 0,
            trainingsCount: lesson.trainings?.length || 0
          })) || []
        }));
      }
      
      if (courseObj.directLessons) {
        courseObj.directLessons = courseObj.directLessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          price: lesson.price,
          videosCount: lesson.videos?.length || 0,
          pdfsCount: lesson.pdfs?.length || 0,
          examsCount: lesson.pdfs?.length || 0,
          trainingsCount: lesson.trainings?.length || 0
        }));
      }
      
      return courseObj;
    });

    console.log('✅ Returning secure featured courses');
    return res.status(200).json({ success: true, data: { courses: secureCourses } });
  } catch (error) {
    console.error('❌ Error in getFeaturedCourses:', error);
    console.error('Error stack:', error.stack);
    
    // Return error response instead of crashing
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch featured courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get course by ID (secure version for public viewing)
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id)
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'title');
        
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Create secure version of course without sensitive data
    const courseObj = course.toObject();
    
    // Clean up units and lessons
    if (courseObj.units) {
      console.log('🔍 Processing units:', courseObj.units.length);
      courseObj.units = courseObj.units.map(unit => {
        console.log(`📚 Unit "${unit.title}":`, {
          lessonsCount: unit.lessons?.length || 0
        });
        return {
          ...unit,
          lessons: unit.lessons?.map(lesson => {
            const lessonData = {
              _id: lesson._id,
              title: lesson.title,
              description: lesson.description,
              price: lesson.price,
              content: lesson.content,
              videosCount: lesson.videos?.length || 0,
              pdfsCount: lesson.pdfs?.length || 0,
              examsCount: lesson.exams?.length || 0,
              trainingsCount: lesson.trainings?.length || 0
              // Exclude actual videos, pdfs, exams, trainings for security
            };
            console.log(`  📚 Lesson "${lesson.title}":`, {
              videos: lesson.videos?.length || 0,
              pdfs: lesson.pdfs?.length || 0,
              exams: lesson.exams?.length || 0,
              trainings: lesson.trainings?.length || 0
            });
            return lessonData;
          }) || []
        };
      });
    }
    
    // Clean up direct lessons
    if (courseObj.directLessons) {
      console.log('🔍 Processing direct lessons:', courseObj.directLessons.length);
      courseObj.directLessons = courseObj.directLessons.map(lesson => {
        const lessonData = {
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          price: lesson.price,
          content: lesson.content,
          videosCount: lesson.videos?.length || 0,
          pdfsCount: lesson.pdfs?.length || 0,
          examsCount: lesson.exams?.length || 0,
          trainingsCount: lesson.trainings?.length || 0
          // Exclude actual videos, pdfs, exams, trainings for security
        };
        console.log(`📚 Lesson "${lesson.title}":`, {
          videos: lesson.videos?.length || 0,
          pdfs: lesson.pdfs?.length || 0,
          exams: lesson.exams?.length || 0,
          trainings: lesson.trainings?.length || 0
        });
        return lessonData;
      });
    }

    return res.status(200).json({ success: true, data: { course: courseObj } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get optimized lesson data with processed exam results
export const getLessonById = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId } = req.query;
    const userId = req.user?._id || req.user?.id;

    const course = await Course.findById(courseId).select('title instructor stage subject units directLessons');
        if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let lesson;
    if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      lesson = unit.lessons.id(lessonId);
    } else {
      lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Process exam data with user results
    const processedExams = lesson.exams.map((exam, examIndex) => {
      const userAttempt = userId ? exam.userAttempts.find(attempt => 
        attempt.userId.toString() === userId.toString()
      ) : null;

      // Check exam availability based on dates
      const now = getCairoNow();
      let examStatus = 'available';
      let statusMessage = '';
      
      if (exam.openDate && now < new Date(exam.openDate)) {
        examStatus = 'not_open';
        statusMessage = `الامتحان غير متاح بعد`;
      } else if (exam.closeDate && now > new Date(exam.closeDate)) {
        examStatus = 'closed';
        statusMessage = `الامتحان مغلق`;
      }

      return {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        timeLimit: exam.timeLimit,
        openDate: exam.openDate,
        closeDate: exam.closeDate,
        examStatus,
        statusMessage,
        questionsCount: exam.questions.length,
        questions: exam.questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          image: q.image
          // Note: correctAnswer is intentionally excluded for security
        })),
        userResult: userAttempt ? {
          score: userAttempt.score,
          totalQuestions: userAttempt.totalQuestions,
          percentage: Math.round((userAttempt.score / userAttempt.totalQuestions) * 100),
          takenAt: userAttempt.takenAt,
          hasTaken: true
        } : { hasTaken: false }
      };
    });

    // Process training data with user results
    const processedTrainings = lesson.trainings.map((training, trainingIndex) => {
      const userAttempts = userId ? training.userAttempts.filter(attempt => 
        attempt.userId.toString() === userId.toString()
      ) : [];

      // Check training availability based on dates
      const now = getCairoNow();
      let trainingStatus = 'available';
      let statusMessage = '';
      
      if (training.openDate && now < new Date(training.openDate)) {
        trainingStatus = 'not_open';
        statusMessage = `Training opens on ${new Date(training.openDate).toLocaleDateString()}`;
      }

      return {
        _id: training._id,
        title: training.title,
        description: training.description,
        timeLimit: training.timeLimit,
        openDate: training.openDate,
        trainingStatus,
        statusMessage,
        questionsCount: training.questions.length,
        questions: training.questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          image: q.image
          // Note: correctAnswer is intentionally excluded for security
        })),
        userResults: userAttempts.map(attempt => ({
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
          takenAt: attempt.takenAt
        })),
        attemptCount: userAttempts.length,
        canRetake: true // Training can always be retaken
      };
    });

    // Optimized lesson response with only necessary data
    const now = getCairoNow();
    console.log('🔍 Current time for filtering (Cairo):', now.toISOString());
    
    const filteredVideos = lesson.videos.filter(video => {
      if (!video.publishDate) {
        console.log(`✅ Video ${video.title || video._id}: No publishDate - showing`);
        return true;
      }
      const publishDate = toCairoTime(video.publishDate);
      // Both dates are now in Cairo timezone for comparison
      const shouldShow = now >= publishDate;
      console.log(`🔍 Video ${video.title || video._id}: publishDate=${publishDate.toISOString()} (Cairo), shouldShow=${shouldShow}`);
      return shouldShow;
    });
    
    const filteredPdfs = lesson.pdfs.filter(pdf => {
      if (!pdf.publishDate) {
        console.log(`✅ PDF ${pdf.title || pdf._id}: No publishDate - showing`);
        return true;
      }
      const publishDate = toCairoTime(pdf.publishDate);
      // Both dates are now in Cairo timezone for comparison
      const shouldShow = now >= publishDate;
      console.log(`🔍 PDF ${pdf.title || pdf._id}: publishDate=${publishDate.toISOString()} (Cairo), shouldShow=${shouldShow}`);
      return shouldShow;
    });
    
    console.log(`📊 Filtering results: ${lesson.videos.length} total videos -> ${filteredVideos.length} visible, ${lesson.pdfs.length} total PDFs -> ${filteredPdfs.length} visible`);
    console.log(`📊 Raw lesson data:`, {
      videos: lesson.videos.map(v => ({ id: v._id, title: v.title, publishDate: v.publishDate })),
      pdfs: lesson.pdfs.map(p => ({ id: p._id, title: p.title, publishDate: p.publishDate }))
    });
    
    const optimizedLesson = {
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      price: lesson.price,
      content: lesson.content,
      videos: filteredVideos.map(video => ({
        _id: video._id,
        url: video.url,
        title: video.title,
        description: video.description,
        publishDate: video.publishDate
      })),
      pdfs: filteredPdfs.map(pdf => ({
        _id: pdf._id,
        url: pdf.url,
        title: pdf.title,
        fileName: pdf.fileName,
        publishDate: pdf.publishDate
      })),
      exams: processedExams,
      trainings: processedTrainings
    };

    return res.status(200).json({ 
      success: true, 
      data: { 
        lesson: optimizedLesson,
        courseInfo: {
          _id: course._id,
          title: course.title
        }
      } 
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Update course
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
            const { title, description, instructor, stage, subject } = req.body;

          console.log('🔄 Updating course:', { id, title, description, instructor, stage, subject });
    console.log('📁 File uploaded:', req.file ? 'Yes' : 'No');

    // Find the existing course
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    console.log('📋 Existing course before update:', {
      id: existingCourse._id,
      title: existingCourse.title,
      image: existingCourse.image
    });

    // Prepare update data
            const updateData = { title, description, instructor, stage, subject };

    // Handle image upload if provided
    if (req.file) {
      try {
        console.log('📸 Processing course image update:', req.file.filename);
        console.log('📁 File details:', {
          originalname: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        });
        
        // Delete old image if exists (local file)
        if (existingCourse.image?.public_id && existingCourse.image.public_id !== 'placeholder') {
          const oldImagePath = path.join('uploads', 'courses', existingCourse.image.public_id);
          if (fs.existsSync(oldImagePath)) {
            fs.rmSync(oldImagePath);
            console.log('🗑️ Deleted old course image:', oldImagePath);
          }
        }
        
        // Move new file to uploads/courses directory
        const uploadsDir = path.join('uploads', 'courses');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const destPath = path.join(uploadsDir, req.file.filename);
        fs.renameSync(req.file.path, destPath);
        
        // Store local file path in database
        updateData.image = {
          public_id: req.file.filename,
          secure_url: `/uploads/courses/${req.file.filename}`
        };
        
        console.log('✅ Course image updated locally:', destPath);
        console.log('📊 Update data image:', updateData.image);
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError);
        
        // Clean up file even if upload fails
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.rmSync(`uploads/${req.file.filename}`);
        }
        
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload image' 
        });
      }
    } else {
      console.log('⚠️ No file uploaded during update');
    }

    // Update course with only basic info (NOT the full content)
    console.log('🔄 About to update course with data:', JSON.stringify(updateData, null, 2));
    
    // Try a different approach - update the existing course object directly
    if (updateData.image) {
      existingCourse.image = updateData.image;
      console.log('🔄 Updated existing course image to:', existingCourse.image);
    }
    
    // Update other fields
    if (updateData.title) existingCourse.title = updateData.title;
    if (updateData.description) existingCourse.description = updateData.description;
    if (updateData.instructor) existingCourse.instructor = updateData.instructor;
    if (updateData.stage) existingCourse.stage = updateData.stage;
    if (updateData.subject) existingCourse.subject = updateData.subject;
    
    
    // Save the updated course
    await existingCourse.save();
    
    // Fetch the updated course with populated fields
    const course = await Course.findById(id)
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'title')

      .select('title description instructor stage subject image createdAt updatedAt');
    
    console.log('✅ Course updated successfully');
    console.log('📊 Final course data:', JSON.stringify(course, null, 2));
    console.log('📊 Update data that was applied:', JSON.stringify(updateData, null, 2));
    
    return res.status(200).json({ 
      success: true, 
      message: 'Course updated', 
      data: { course } 
    });
  } catch (error) {
    console.error('❌ Update course error:', error);
    return next(new AppError(error.message, 500));
  }
};

// Delete course
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the course first to get image info
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Delete image from local storage if exists
    if (course.image?.public_id && course.image.public_id !== 'placeholder') {
      try {
        const imagePath = path.join('uploads', 'courses', course.image.public_id);
        if (fs.existsSync(imagePath)) {
          fs.rmSync(imagePath);
          console.log('🗑️ Deleted course image from local storage:', imagePath);
        }
      } catch (e) {
        console.log('Error deleting image:', e.message);
      }
    }
    
    // Delete the course
    await Course.findByIdAndDelete(id);
    
    return res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get course stats
export const getCourseStats = async (req, res, next) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalUnits = await Course.aggregate([
      { $unwind: '$units' },
      { $count: 'total' }
    ]);
    const totalLessons = await Course.aggregate([
      { $unwind: '$units' },
      { $unwind: '$units.lessons' },
      { $count: 'total' }
    ]);
    
    const stats = {
      totalCourses,
      totalUnits: totalUnits[0]?.total || 0,
      totalLessons: totalLessons[0]?.total || 0
    };
    
    return res.status(200).json({ success: true, data: stats });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Add a unit to a course
export const addUnitToCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, price } = req.body.unitData;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Unit title is required' });
    }
    const course = await Course.findById(courseId);
        if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    course.units.push({ title, description, price, lessons: [] });
        await course.save();
    return res.status(200).json({ success: true, message: 'Unit added', data: { course } });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Add a lesson to a unit by unit ID
export const addLessonToUnit = async (req, res, next) => {
    try {
        const { courseId, unitId } = req.params;
    const { lessonData } = req.body;
    const { title, description, price, content } = lessonData;
        if (!title) {
      return res.status(400).json({ success: false, message: 'Lesson title is required' });
        }
    const course = await Course.findById(courseId);
        if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const unit = course.units.id(unitId);
        if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    unit.lessons.push({ title, description, price, content });
        await course.save();
    return res.status(200).json({ success: true, message: 'Lesson added to unit', data: { course } });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Add a direct lesson to a course
export const addDirectLessonToCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonData } = req.body;
    const { title, description, price, content } = lessonData;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Lesson title is required' });
    }
    const course = await Course.findById(courseId);
        if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    course.directLessons.push({ title, description, price, content });
        await course.save();
    return res.status(200).json({ success: true, message: 'Direct lesson added', data: { course } });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Update a lesson by lesson ID
export const updateLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, lessonData } = req.body;
    const { title, description, price } = lessonData;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Lesson title is required' });
    }
    const course = await Course.findById(courseId);
        if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
        if (unitId) {
      // Update lesson in unit
      const unit = course.units.id(unitId);
      if (!unit) {
        return res.status(404).json({ success: false, message: 'Unit not found' });
      }
      const lesson = unit.lessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found in unit' });
      }
      lesson.title = title;
      lesson.description = description;
      lesson.price = price;
        } else {
      // Update direct lesson
      const lesson = course.directLessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Direct lesson not found' });
      }
      lesson.title = title;
      lesson.description = description;
      lesson.price = price;
    }
        await course.save();
    return res.status(200).json({ success: true, message: 'Lesson updated', data: { course } });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Update a lesson content by lesson ID
export const updateLessonContent = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, videos, pdfs, exams, trainings } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    
    let lesson;
    if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      lesson = unit.lessons.id(lessonId);
    } else {
      lesson = course.directLessons.id(lessonId);
    }
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    
    // Store old lesson data for comparison
    const oldLesson = {
      videos: lesson.videos || [],
      pdfs: lesson.pdfs || [],
      exams: lesson.exams || [],
      trainings: lesson.trainings || []
    };
    
    // Update lesson content
    if (videos !== undefined) lesson.videos = videos;
    if (pdfs !== undefined) lesson.pdfs = pdfs;
    if (exams !== undefined) lesson.exams = exams;
    if (trainings !== undefined) lesson.trainings = trainings;
    
    await course.save();
    
    // Import notification helper and detect changes
    const { notifyUsersOfNewContent, detectContentChanges } = await import('../utils/notificationHelper.js');
    
    // Detect what content was added
    const changes = detectContentChanges(oldLesson, lesson);
    
    // Send notifications for each type of new content
    for (const change of changes) {
      await notifyUsersOfNewContent(course, change.type, change.details);
    }
    
    if (changes.length > 0) {
      console.log('🔔 Sent notifications for', changes.length, 'content changes in course:', course.title);
    }
    
    return res.status(200).json({ success: true, message: 'Lesson content updated', data: { lesson } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Delete a lesson by lesson ID
export const deleteLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId } = req.body;
    const course = await Course.findById(courseId);
        if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

        if (unitId) {
      // Delete lesson from unit
      const unit = course.units.id(unitId);
      if (!unit) {
        return res.status(404).json({ success: false, message: 'Unit not found' });
      }
      const lesson = unit.lessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found in unit' });
      }
      lesson.deleteOne();
        } else {
      // Delete direct lesson
      const lesson = course.directLessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Direct lesson not found' });
      }
      lesson.deleteOne();
        }

        await course.save();
    return res.status(200).json({ success: true, message: 'Lesson deleted', data: { course } });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Delete a unit by unit ID
export const deleteUnit = async (req, res, next) => {
    try {
    const { courseId, unitId } = req.params;
    const course = await Course.findById(courseId);
        if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    
    unit.deleteOne();
    await course.save();
    return res.status(200).json({ success: true, message: 'Unit deleted', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Update a unit by unit ID
export const updateUnit = async (req, res, next) => {
  try {
    const { courseId, unitId } = req.params;
    const { unitData } = req.body;
    const { title, description, price } = unitData;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Unit title is required' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    unit.title = title;
    unit.description = description;
    unit.price = price;
        await course.save();
    return res.status(200).json({ success: true, message: 'Unit updated', data: { course } });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Reorder lessons in a unit or direct lessons
export const reorderLessons = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { unitId, lessonId, newIndex } = req.body;
    const course = await Course.findById(courseId);
        if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (unitId) {
      // Reorder lesson in unit
      const unit = course.units.id(unitId);
      if (!unit) {
        return res.status(404).json({ success: false, message: 'Unit not found' });
      }
      const lesson = unit.lessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found in unit' });
      }
      
      // Remove lesson from current position
      lesson.deleteOne();
      // Insert at new position
      unit.lessons.splice(newIndex, 0, lesson);
        } else {
      // Reorder direct lesson
      const lesson = course.directLessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Direct lesson not found' });
      }
      
      // Remove lesson from current position
      lesson.deleteOne();
      // Insert at new position
      course.directLessons.splice(newIndex, 0, lesson);
        }

        await course.save();
    return res.status(200).json({ success: true, message: 'Lesson reordered', data: { course } });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Take an exam
export const takeExam = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, examIndex, answers } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let lesson;
        if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      lesson = unit.lessons.id(lessonId);
    } else {
      lesson = course.directLessons.id(lessonId);
    }
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const exam = lesson.exams[examIndex];
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // Check if user has already taken this exam
    const existingAttempt = exam.userAttempts.find(attempt => attempt.userId.toString() === userId.toString());
    if (existingAttempt) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already taken this exam',
        data: { 
          score: existingAttempt.score,
          totalQuestions: existingAttempt.totalQuestions,
          takenAt: existingAttempt.takenAt
        }
      });
    }

    // Check if exam is open
    const now = getCairoNow();
    if (exam.openDate && now < new Date(exam.openDate)) {
      return res.status(400).json({ success: false, message: 'Exam is not open yet' });
    }
    if (exam.closeDate && now > new Date(exam.closeDate)) {
      return res.status(400).json({ success: false, message: 'Exam is closed' });
    }

    // Calculate score
    let score = 0;
    const answerDetails = [];
    
    exam.questions.forEach((question, questionIndex) => {
      const userAnswer = answers.find(ans => ans.questionIndex === questionIndex);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) score++;
      
      answerDetails.push({
        questionIndex,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
        isCorrect
      });
    });

    // Save attempt
    const attempt = {
      userId,
      takenAt: now,
      score,
      totalQuestions: exam.questions.length,
      answers: answerDetails
    };

    exam.userAttempts.push(attempt);
    await course.save();

    return res.status(200).json({
            success: true,
      message: 'Exam submitted successfully',
            data: {
        score,
        totalQuestions: exam.questions.length,
        percentage: Math.round((score / exam.questions.length) * 100)
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get exam results for a user
export const getExamResults = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, examIndex } = req.query;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let lesson;
    if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      lesson = unit.lessons.id(lessonId);
    } else {
      lesson = course.directLessons.id(lessonId);
    }
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const exam = lesson.exams[examIndex];
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const attempt = exam.userAttempts.find(attempt => attempt.userId.toString() === userId.toString());
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'No exam attempt found' });
    }

            return res.status(200).json({
                success: true,
                data: {
        exam: {
          title: exam.title,
          description: exam.description,
          openDate: exam.openDate,
          closeDate: exam.closeDate
        },
        attempt: {
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
          takenAt: attempt.takenAt,
          answers: attempt.answers
        }
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Submit a training attempt
export const submitTrainingAttempt = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, trainingIndex, answers } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let lesson;
    if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      lesson = unit.lessons.id(lessonId);
    } else {
      lesson = course.directLessons.id(lessonId);
    }
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const training = lesson.trainings[trainingIndex];
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });

    // Check if training is open
    const now = getCairoNow();
    if (training.openDate && now < new Date(training.openDate)) {
      return res.status(400).json({ success: false, message: 'Training is not open yet' });
    }

    // Calculate score
    let score = 0;
    const answerDetails = [];
    
    training.questions.forEach((question, questionIndex) => {
      const userAnswer = answers.find(ans => ans.questionIndex === questionIndex);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) score++;
      
      answerDetails.push({
        questionIndex,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
        isCorrect
      });
    });

    // Save attempt (no restriction on number of attempts)
    const attempt = {
      userId,
      takenAt: now,
      score,
      totalQuestions: training.questions.length,
      answers: answerDetails
    };

    training.userAttempts.push(attempt);
    await course.save();

    return res.status(200).json({
            success: true,
      message: 'Training attempt submitted successfully',
            data: {
        score,
        totalQuestions: training.questions.length,
        percentage: Math.round((score / training.questions.length) * 100)
      }
    });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};
