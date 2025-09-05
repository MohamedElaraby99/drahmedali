import ExamResult from '../models/examResult.model.js';
import User from '../models/user.model.js';
import Course from '../models/course.model.js';
import AppError from '../utils/error.utils.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all exam results for admin dashboard
const getAllExamResults = async (req, res, next) => {
    try {
        console.log('📊 Getting all exam results for admin dashboard...');
        
        const { 
            page = 1, 
            limit = 20, 
            userId, 
            courseId, 
            examType, 
            passed, 
            sortBy = 'completedAt', 
            sortOrder = 'desc',
            search,
            stageId
        } = req.query;

        console.log('📊 Query parameters:', { page, limit, userId, courseId, examType, passed, search, stageId });

        const skip = (page - 1) * limit;
        
        // Build basic filter
        let filter = {};
        
        if (userId) filter.user = userId;
        if (courseId) filter.course = courseId;
        if (examType) filter.examType = examType;
        if (passed !== undefined) filter.passed = passed === 'true';

        console.log('📊 Basic filter:', filter);

        // Debug: Check what exam results exist and their course IDs
        const rawResults = await ExamResult.find(filter).select('course user lessonTitle').limit(5);
        console.log('📊 Raw exam results sample:', rawResults.map(r => ({
            _id: r._id,
            courseId: r.course,
            userId: r.user,
            lesson: r.lessonTitle
        })));

        // Debug: Check if any courses exist at all
        const courseCount = await Course.countDocuments();
        console.log('📊 Total courses in database:', courseCount);

        // Get exam results with populated data
        let query = ExamResult.find(filter)
            .populate('user', 'fullName email stage')
            .populate('course', 'title instructor stage subject');

        // Apply sorting
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
        query = query.sort(sortObj);

        // Get total count for pagination
        const totalCount = await ExamResult.countDocuments(filter);
        
        // Apply pagination
        const examResults = await query.skip(skip).limit(parseInt(limit));

        console.log(`📊 Found ${examResults.length} exam results out of ${totalCount} total`);
        
        // Debug: Check what we actually got from the database
        for (let i = 0; i < examResults.length; i++) {
            const result = examResults[i];
            console.log(`📊 Result ${i + 1} debug:`, {
                _id: result._id,
                courseId: result.course,
                coursePopulated: !!result.course,
                courseType: typeof result.course,
                userPopulated: !!result.user,
                lessonTitle: result.lessonTitle
            });
            
            // Check if course exists independently
            if (result.course && typeof result.course === 'string') {
                const courseExists = await Course.findById(result.course);
                console.log(`📊 Course ${result.course} exists:`, !!courseExists);
                if (courseExists) {
                    console.log(`📊 Course details:`, {
                        title: courseExists.title,
                        instructor: courseExists.instructor,
                        stage: courseExists.stage,
                        subject: courseExists.subject
                    });
                }
            }
        }

        // Filter by stage if specified (after population)
        let filteredResults = examResults;
        if (stageId) {
            filteredResults = examResults.filter(result => {
                const userStageId = result.user?.stage?._id?.toString() || result.user?.stage?.toString();
                const courseStageId = result.course?.stage?._id?.toString() || result.course?.stage?.toString();
                return userStageId === stageId || courseStageId === stageId;
            });
            console.log(`📊 After stage filtering (${stageId}): ${filteredResults.length} results`);
        }

        // Apply search filter if provided (after population)
        if (search) {
            const searchLower = search.toLowerCase();
            filteredResults = filteredResults.filter(result => {
                return (
                    result.user?.fullName?.toLowerCase().includes(searchLower) ||
                    result.user?.email?.toLowerCase().includes(searchLower) ||
                    result.course?.title?.toLowerCase().includes(searchLower) ||
                    result.lessonTitle?.toLowerCase().includes(searchLower) ||
                    result.unitTitle?.toLowerCase().includes(searchLower)
                );
            });
            console.log(`📊 After search filtering ("${search}"): ${filteredResults.length} results`);
        }

        // Format the results
        const formattedResults = await Promise.all(filteredResults.map(async (result) => {
            // If course is not populated, try to fetch it manually
            let courseData = result.course;
            if (!courseData || typeof courseData === 'string') {
                try {
                    courseData = await Course.findById(result.course || courseData)
                        .populate('instructor', 'name')
                        .populate('stage', 'name')
                        .populate('subject', 'title');
                    console.log(`📊 Manually fetched course for result ${result._id}:`, courseData ? courseData.title : 'NOT FOUND');
                } catch (error) {
                    console.log(`📊 Error fetching course ${result.course}:`, error.message);
                    courseData = null;
                }
            }
            
            const formatted = {
                _id: result._id,
                user: {
                    _id: result.user?._id,
                    fullName: result.user?.fullName || 'Unknown User',
                    email: result.user?.email || 'No Email',
                    username: result.user?.username,
                    stage: result.user?.stage?.name || 'Unknown Stage'
                },
                course: {
                    _id: courseData?._id || result.course,
                    title: courseData?.title || 'Course Not Found',
                    instructor: courseData?.instructor?.name || 'Unknown Instructor',
                    stage: courseData?.stage?.name || 'Unknown Stage',
                    subject: courseData?.subject?.title || 'Unknown Subject'
                },
                lessonTitle: result.lessonTitle || 'Unknown Lesson',
                unitTitle: result.unitTitle || null,
                examType: result.examType,
                score: result.score,
                totalQuestions: result.totalQuestions,
                correctAnswers: result.correctAnswers,
                wrongAnswers: result.wrongAnswers,
                timeTaken: result.timeTaken,
                timeLimit: result.timeLimit,
                passingScore: result.passingScore,
                passed: result.passed,
                completedAt: result.completedAt,
                answers: result.answers || []
            };
            
            console.log('📊 Formatted result sample:', {
                resultId: formatted._id,
                originalCourseId: result.course,
                user: formatted.user.fullName,
                course: formatted.course.title,
                userStage: formatted.user.stage,
                courseStage: formatted.course.stage,
                score: formatted.score
            });
            
            return formatted;
        }));

        // Calculate summary statistics from all matching results (not just current page)
        const allMatchingResults = await ExamResult.find(filter);
        let summaryResults = allMatchingResults;

        // Apply stage filter to summary if specified
        if (stageId) {
            const populatedSummaryResults = await ExamResult.find(filter)
                .populate('user', 'stage')
                .populate('course', 'stage');
                
            summaryResults = populatedSummaryResults.filter(result => {
                const userStageId = result.user?.stage?._id?.toString() || result.user?.stage?.toString();
                const courseStageId = result.course?.stage?._id?.toString() || result.course?.stage?.toString();
                return userStageId === stageId || courseStageId === stageId;
            });
        }

        const summary = {
            totalAttempts: summaryResults.length,
            averageScore: summaryResults.length > 0 ? summaryResults.reduce((sum, r) => sum + r.score, 0) / summaryResults.length : 0,
            passedCount: summaryResults.filter(r => r.passed).length,
            failedCount: summaryResults.filter(r => !r.passed).length,
            averageTimeTaken: summaryResults.length > 0 ? summaryResults.reduce((sum, r) => sum + (r.timeTaken || 0), 0) / summaryResults.length : 0
        };

        const totalPages = Math.ceil(filteredResults.length / limit);

        console.log('📊 Final summary:', summary);
        console.log('📊 Returning:', {
            totalResults: formattedResults.length,
            currentPage: parseInt(page),
            totalPages
        });

        res.status(200).json({
            success: true,
            message: 'Exam results retrieved successfully',
            data: formattedResults,
            summary: summary,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                total: filteredResults.length,
                limit: parseInt(limit),
                totalResults: filteredResults.length,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('❌ Error in getAllExamResults:', error);
        return next(new AppError(error.message, 500));
    }
};

// Get exam results statistics
const getExamResultsStats = async (req, res, next) => {
    try {
        // Overall statistics
        const totalResults = await ExamResult.countDocuments();
        const passedResults = await ExamResult.countDocuments({ passed: true });
        const failedResults = await ExamResult.countDocuments({ passed: false });
        const trainingExams = await ExamResult.countDocuments({ examType: 'training' });
        const finalExams = await ExamResult.countDocuments({ examType: 'final' });

        // Average score
        const avgScoreResult = await ExamResult.aggregate([
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: '$score' },
                    averageTimeTaken: { $avg: '$timeTaken' }
                }
            }
        ]);

        const averageScore = avgScoreResult[0]?.averageScore || 0;
        const averageTimeTaken = avgScoreResult[0]?.averageTimeTaken || 0;

        // Top performing users
        const topUsers = await ExamResult.aggregate([
            {
                $group: {
                    _id: '$user',
                    averageScore: { $avg: '$score' },
                    totalExams: { $sum: 1 },
                    passedExams: { $sum: { $cond: ['$passed', 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            { $sort: { averageScore: -1 } },
            { $limit: 10 },
            {
                $project: {
                    userId: '$_id',
                    userName: '$userInfo.fullName',
                    userEmail: '$userInfo.email',
                    averageScore: 1,
                    totalExams: 1,
                    passedExams: 1,
                    passRate: { $multiply: [{ $divide: ['$passedExams', '$totalExams'] }, 100] }
                }
            }
        ]);

        // Course performance
        const coursePerformance = await ExamResult.aggregate([
            {
                $group: {
                    _id: '$course',
                    averageScore: { $avg: '$score' },
                    totalAttempts: { $sum: 1 },
                    passedAttempts: { $sum: { $cond: ['$passed', 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: '$courseInfo' },
            { $sort: { averageScore: -1 } },
            { $limit: 10 },
            {
                $project: {
                    courseId: '$_id',
                    courseTitle: '$courseInfo.title',
                    averageScore: 1,
                    totalAttempts: 1,
                    passedAttempts: 1,
                    passRate: { $multiply: [{ $divide: ['$passedAttempts', '$totalAttempts'] }, 100] }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Exam results statistics retrieved successfully',
            data: {
                overview: {
                    totalResults,
                    passedResults,
                    failedResults,
                    trainingExams,
                    finalExams,
                    averageScore: Math.round(averageScore * 100) / 100,
                    averageTimeTaken: Math.round(averageTimeTaken * 100) / 100,
                    passRate: totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0
                },
                topUsers,
                coursePerformance
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get specific exam result by ID
const getExamResultById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const examResult = await ExamResult.findById(id)
            .populate({
                path: 'user',
                select: 'fullName email username'
            })
            .populate({
                path: 'course',
                select: 'title instructor stage subject',
                populate: [
                    {
                        path: 'instructor',
                        select: 'name'
                    },
                    {
                        path: 'stage',
                        select: 'name'
                    },
                    {
                        path: 'subject',
                        select: 'title'
                    }
                ]
            });

        if (!examResult) {
            return next(new AppError('Exam result not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Exam result retrieved successfully',
            data: {
                id: examResult._id,
                user: {
                    id: examResult.user._id,
                    name: examResult.user.fullName,
                    email: examResult.user.email,
                    username: examResult.user.username
                },
                course: {
                    id: examResult.course._id,
                    title: examResult.course.title,
                    instructor: examResult.course.instructor?.name || 'Unknown',
                    stage: examResult.course.stage?.name || 'Unknown',
                    subject: examResult.course.subject?.title || 'Unknown'
                },
                lesson: {
                    id: examResult.lessonId,
                    title: examResult.lessonTitle,
                    unitId: examResult.unitId,
                    unitTitle: examResult.unitTitle
                },
                exam: {
                    type: examResult.examType,
                    score: examResult.score,
                    totalQuestions: examResult.totalQuestions,
                    correctAnswers: examResult.correctAnswers,
                    wrongAnswers: examResult.wrongAnswers,
                    timeTaken: examResult.timeTaken,
                    timeLimit: examResult.timeLimit,
                    passingScore: examResult.passingScore,
                    passed: examResult.passed,
                    answers: examResult.answers
                },
                completedAt: examResult.completedAt,
                createdAt: examResult.createdAt,
                updatedAt: examResult.updatedAt
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Export exam results to CSV
const exportExamResults = async (req, res, next) => {
    try {
        const { 
            userId, 
            courseId, 
            examType, 
            passed, 
            sortBy = 'completedAt', 
            sortOrder = 'desc',
            search
        } = req.query;

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Build match filter
        let matchFilter = {};
        
        if (userId) {
            matchFilter.user = userId;
        }
        
        if (courseId) {
            matchFilter.course = courseId;
        }
        
        if (examType) {
            matchFilter.examType = examType;
        }
        
        if (passed !== undefined) {
            matchFilter.passed = passed === 'true';
        }

        // Get all results without pagination for export
        const results = await ExamResult.find(matchFilter)
            .populate('user', 'fullName email phoneNumber')
            .populate('course', 'title')
            .sort(sort);

        // Apply search filter if provided
        let filteredResults = results;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredResults = results.filter(result => 
                result.user?.fullName?.toLowerCase().includes(searchLower) ||
                result.user?.email?.toLowerCase().includes(searchLower) ||
                result.user?.username?.toLowerCase().includes(searchLower) ||
                result.course?.title?.toLowerCase().includes(searchLower) ||
                result.lessonTitle?.toLowerCase().includes(searchLower)
            );
        }

        // Create CSV content
        const csvHeaders = [
            'اسم الطالب',
            'البريد الإلكتروني',
            'الدورة',
            'الدرس',
            'الوحدة',
            'نوع الامتحان',
            'النتيجة (%)',
            'الإجابات الصحيحة',
            'إجمالي الأسئلة',
            'الإجابات الخاطئة',
            'الوقت المستغرق (دقيقة)',
            'الحد الزمني (دقيقة)',
            'النتيجة المطلوبة للنجاح (%)',
            'حالة النجاح',
            'تاريخ الامتحان'
        ].join(',');

        const csvRows = filteredResults.map(result => [
            `"${result.user?.fullName || ''}"`,
            `"${result.user?.email || ''}"`,
            `"${result.course?.title || ''}"`,
            `"${result.lessonTitle || ''}"`,
            `"${result.unitTitle || ''}"`,
            `"${result.examType === 'final' ? 'امتحان نهائي' : 'تدريب'}"`,
            result.score,
            result.correctAnswers,
            result.totalQuestions,
            result.wrongAnswers,
            result.timeTaken,
            result.timeLimit,
            result.passingScore,
            `"${result.passed ? 'ناجح' : 'راسب'}"`,
            `"${new Date(result.completedAt).toLocaleString('ar-EG')}"`
        ].join(','));

        const csvContent = [csvHeaders, ...csvRows].join('\n');

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="exam-results-${new Date().toISOString().split('T')[0]}.csv"`);
        
        // Add BOM for proper UTF-8 encoding in Excel
        res.write('\ufeff');
        res.end(csvContent);

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get exam results for a specific lesson
const getExamResults = asyncHandler(async (req, res) => {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id || req.user.id;

    try {
        const results = await ExamResult.find({
            course: courseId,
            lessonId: lessonId,
            user: userId
        }).sort({ completedAt: -1 });

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error getting exam results:', error);
        throw new AppError('فشل في جلب نتائج الامتحانات', 500);
    }
});

// Get user's exam history
const getUserExamHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;

    try {
        const results = await ExamResult.find({ user: userId })
            .populate('course', 'title')
            .sort({ completedAt: -1 });

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error getting user exam history:', error);
        throw new AppError('فشل في جلب تاريخ الامتحانات', 500);
    }
});

// Get user exam results for student report
const getUserExamResults = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        const results = await ExamResult.find({ user: userId })
            .populate('course', 'title subject')
            .sort({ completedAt: -1 });

        // Format results for student report
        const formattedResults = results.map(result => ({
            examName: result.lessonTitle || 'امتحان',
            subject: result.course?.subject || result.course?.title || 'غير محدد',
            score: result.correctAnswers || 0,
            totalMarks: result.totalQuestions || 0,
            percentage: result.score || 0,
            date: result.completedAt,
            passed: result.passed
        }));

        res.status(200).json({
            success: true,
            data: formattedResults
        });
    } catch (error) {
        console.error('Error getting user exam results:', error);
        res.status(200).json({
            success: true,
            data: []
        });
    }
});

// Get exam statistics
const getExamStatistics = asyncHandler(async (req, res) => {
    try {
        const totalResults = await ExamResult.countDocuments();
        const passedResults = await ExamResult.countDocuments({ passed: true });
        const failedResults = await ExamResult.countDocuments({ passed: false });
        const trainingResults = await ExamResult.countDocuments({ examType: 'training' });
        const finalResults = await ExamResult.countDocuments({ examType: 'final' });

        const avgScore = await ExamResult.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$score' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalResults,
                passedResults,
                failedResults,
                trainingResults,
                finalResults,
                averageScore: avgScore[0]?.avgScore || 0
            }
        });
    } catch (error) {
        console.error('Error getting exam statistics:', error);
        throw new AppError('فشل في جلب إحصائيات الامتحانات', 500);
    }
});

// Search exam results (admin only) - Enhanced to include both completed results and available exams
const searchExamResults = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        search = '',
        examType = '',
        courseId = '',
        userId = '',
        dateFrom = '',
        dateTo = '',
        scoreFilter = '',
        status = ''
    } = req.query;

    try {
        // 1. Get completed exam results from ExamResult collection
        const filter = {};
        
        if (examType) filter.examType = examType;
        if (courseId) filter.course = courseId;
        if (userId) filter.user = userId;
        
        if (dateFrom || dateTo) {
            filter.completedAt = {};
            if (dateFrom) filter.completedAt.$gte = new Date(dateFrom);
            if (dateTo) filter.completedAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
        }
        
        if (scoreFilter) {
            const [minScore, maxScore] = scoreFilter.split('-').map(Number);
            filter.score = {};
            if (minScore !== undefined) filter.score.$gte = minScore;
            if (maxScore !== undefined) filter.score.$lte = maxScore;
        }
        
        if (status) filter.passed = status === 'passed';

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const pageLimit = parseInt(limit);

        // Get completed exam results
        const totalCompleted = await ExamResult.countDocuments(filter);
        const completedResults = await ExamResult.find(filter)
            .populate('user', 'fullName email')
            .populate('course', 'title')
            .sort({ completedAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean();

        // 2. Get ALL exams with user progress from Course structure (including completed ones)
        let allExamsFromLessons = [];
        
        // Always fetch all exams from lessons to show complete picture
        const courses = await Course.find({
            $or: [
                { 'units.lessons.exams': { $exists: true, $ne: [] } },
                { 'directLessons.exams': { $exists: true, $ne: [] } }
            ]
        }).select('title units directLessons').lean();

        console.log(`🔍 Found ${courses.length} courses with exams`);

        for (const course of courses) {
            console.log(`📚 Processing course: ${course.title}`);
            
            // Process direct lessons
            if (course.directLessons) {
                for (const lesson of course.directLessons) {
                    if (lesson.exams && lesson.exams.length > 0) {
                        for (const exam of lesson.exams) {
                            console.log(`  📖 Processing exam: ${exam.title}`);
                            console.log(`    - userResult:`, exam.userResult);
                            
                            // Check if this exam has user results - be more flexible with the check
                            const hasUserResult = exam.userResult && (
                                exam.userResult.hasTaken === true || 
                                exam.userResult.score !== undefined || 
                                exam.userResult.percentage !== undefined
                            );
                            
                            console.log(`    - hasUserResult: ${hasUserResult}`);
                            
                            allExamsFromLessons.push({
                                _id: `lesson_${exam._id}`,
                                type: hasUserResult ? 'completed' : 'available',
                                course: { title: course.title },
                                lesson: { title: lesson.title },
                                exam: {
                                    title: exam.title,
                                    description: exam.description,
                                    timeLimit: exam.timeLimit,
                                    questionsCount: exam.questions?.length || 0
                                },
                                userResult: exam.userResult || { hasTaken: false },
                                examType: 'final',
                                isAvailable: !hasUserResult,
                                isCompleted: hasUserResult,
                                // If user has taken the exam, include the result data
                                ...(hasUserResult && {
                                    score: exam.userResult.score || 0,
                                    percentage: exam.userResult.percentage || 0,
                                    correctAnswers: exam.userResult.score || 0,
                                    totalQuestions: exam.userResult.totalQuestions || 0,
                                    completedAt: exam.userResult.takenAt || new Date(),
                                    passed: (exam.userResult.percentage || 0) >= 50, // Assuming 50% is passing
                                    user: {
                                        fullName: 'طالب', // We don't have user details in lesson structure
                                        username: 'طالب',
                                        email: 'طالب'
                                    }
                                })
                            });
                        }
                    }
                }
            }

            // Process unit lessons
            if (course.units) {
                for (const unit of course.units) {
                    if (unit.lessons) {
                        for (const lesson of unit.lessons) {
                            if (lesson.exams && lesson.exams.length > 0) {
                                for (const exam of lesson.exams) {
                                    console.log(`  📖 Processing exam: ${exam.title} (Unit: ${unit.title})`);
                                    console.log(`    - userResult:`, exam.userResult);
                                    
                                    // Check if this exam has user results - be more flexible with the check
                                    const hasUserResult = exam.userResult && (
                                        exam.userResult.hasTaken === true || 
                                        exam.userResult.score !== undefined || 
                                        exam.userResult.percentage !== undefined
                                    );
                                    
                                    console.log(`    - hasUserResult: ${hasUserResult}`);
                                    
                                    allExamsFromLessons.push({
                                        _id: `lesson_${exam._id}`,
                                        type: hasUserResult ? 'completed' : 'available',
                                        course: { title: course.title },
                                        lesson: { title: lesson.title },
                                        unit: { title: unit.title },
                                        exam: {
                                            title: exam.title,
                                            description: exam.description,
                                            timeLimit: exam.timeLimit,
                                            questionsCount: exam.questions?.length || 0
                                        },
                                        userResult: exam.userResult || { hasTaken: false },
                                        examType: 'final',
                                        isAvailable: !hasUserResult,
                                        isCompleted: hasUserResult,
                                        // If user has taken the exam, include the result data
                                        ...(hasUserResult && {
                                            score: exam.userResult.score || 0,
                                            percentage: exam.userResult.percentage || 0,
                                            correctAnswers: exam.userResult.score || 0,
                                            totalQuestions: exam.userResult.totalQuestions || 0,
                                            completedAt: exam.userResult.takenAt || new Date(),
                                            passed: (exam.userResult.percentage || 0) >= 50, // Assuming 50% is passing
                                            user: {
                                                fullName: 'طالب', // We don't have user details in lesson structure
                                                username: 'طالب',
                                                email: 'طالب'
                                            }
                                        })
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        // 3. Combine and transform results
        const transformedCompleted = completedResults.map(result => ({
            _id: result._id,
            type: 'completed',
            user: {
                fullName: result.user?.fullName,
                username: result.user?.username,
                email: result.user?.email
            },
            course: {
                title: result.course?.title
            },
            lesson: {
                title: result.lessonTitle
            },
            examType: result.examType,
            score: result.score,
            percentage: result.score,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            timeTaken: result.timeTaken,
            passed: result.passed,
            completedAt: result.completedAt,
            answers: result.answers,
            isCompleted: true
        }));

        // Combine results (completed from ExamResult collection first, then all from lessons)
        const allResults = [...transformedCompleted, ...allExamsFromLessons];
        const total = totalCompleted + allExamsFromLessons.length;

        res.status(200).json({
            success: true,
            data: {
                results: allResults,
                total,
                page: parseInt(page),
                limit: pageLimit,
                totalPages: Math.ceil(total / pageLimit),
                completedCount: totalCompleted,
                availableCount: allExamsFromLessons.filter(exam => !exam.isCompleted).length,
                lessonExamsCount: allExamsFromLessons.length
            }
        });

    } catch (error) {
        console.error('Error searching exam results:', error);
        throw new AppError('فشل في البحث عن نتائج الامتحانات', 500);
    }
});


export {
    getAllExamResults,
    getExamResultsStats,
    getExamResultById,
    exportExamResults,
    getExamResults,
    getUserExamHistory,
    getUserExamResults,
    getExamStatistics,
    searchExamResults
};