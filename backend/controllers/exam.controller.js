import ExamResult from "../models/examResult.model.js";
import Course from "../models/course.model.js";
import AppError from "../utils/error.utils.js";

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Take training exam
const takeTrainingExam = asyncHandler(async (req, res) => {
    const { courseId, lessonId, unitId, examId, answers, startTime } = req.body;
    
    console.log('=== TRAINING EXAM BACKEND DEBUG ===');
    console.log('Request Body:', req.body);
    console.log('User:', req.user);
    console.log('User._id:', req.user._id);
    console.log('User.id:', req.user.id);
    console.log('User fields:', Object.keys(req.user || {}));
    
    // Try both _id and id fields from the JWT token
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
        throw new AppError("User ID not found in request", 400);
    }

    // Find the course and lesson
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    let lesson = null;
    let unit = null;

    // Find lesson in units or direct lessons
    if (unitId) {
        unit = course.units.id(unitId);
        if (!unit) {
            throw new AppError("Unit not found", 404);
        }
        lesson = unit.lessons.id(lessonId);
    } else {
        lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }

    // Find the specific training by ID
    const training = lesson.trainings.id(examId);
    if (!training || !training.questions || training.questions.length === 0) {
        throw new AppError("Training not found or has no questions", 400);
    }

    // Check if training is open based on dates
    const now = new Date();
    if (training.openDate && now < new Date(training.openDate)) {
        throw new AppError("Training is not open yet", 400);
    }

    // Calculate results
    const questions = training.questions;
    let correctAnswers = 0;
    const detailedAnswers = [];

    answers.forEach((answer) => {
        const question = questions[answer.questionIndex];
        if (!question) return;
        
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        
        if (isCorrect) {
            correctAnswers++;
        }

        detailedAnswers.push({
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            isCorrect
        });
    });

    const totalQuestions = questions.length;
    const score = correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Calculate time taken
    const endTime = new Date();
    let timeTaken = 0;
    
    if (startTime) {
        const start = new Date(startTime);
        timeTaken = Math.round((endTime - start) / 1000 / 60); // Convert to minutes
        console.log('⏱️ Time calculation:', {
            startTime: start,
            endTime: endTime,
            timeTakenMinutes: timeTaken
        });
    } else {
        console.log('⚠️ No startTime provided, using timeTaken from request body');
        timeTaken = req.body.timeTaken || 0;
    }

    // Save attempt to training
    const attempt = {
        userId,
        takenAt: endTime,
        score,
        totalQuestions,
        answers: detailedAnswers
    };

    training.userAttempts.push(attempt);
    await course.save();

    res.status(201).json({
        success: true,
        message: "Training completed successfully",
        data: {
            examType: 'training',
            examId: training._id,
            courseId,
            lessonId,
            unitId: unitId || null,
            score,
            totalQuestions,
            percentage,
            correctAnswers,
            wrongAnswers: totalQuestions - correctAnswers,
            timeTaken: timeTaken,
            answers: detailedAnswers,
            questionsWithAnswers: questions.map((question, index) => ({
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation || '',
                userAnswer: detailedAnswers[index]?.selectedAnswer,
                isCorrect: detailedAnswers[index]?.isCorrect,
                questionIndex: index
            }))
        }
    });
});

// Take final exam
const takeFinalExam = asyncHandler(async (req, res) => {
    const { courseId, lessonId, unitId, examId, answers, startTime } = req.body;
    
    console.log('=== FINAL EXAM BACKEND DEBUG ===');
    console.log('Request Body:', req.body);
    console.log('User:', req.user);
    console.log('User._id:', req.user._id);
    console.log('User.id:', req.user.id);
    console.log('User fields:', Object.keys(req.user || {}));
    console.log('Course ID:', courseId);
    console.log('Lesson ID:', lessonId);
    console.log('Unit ID:', unitId);
    console.log('Exam ID:', examId);
    console.log('Answers:', answers);
    
    // Try both _id and id fields from the JWT token
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
        throw new AppError("User ID not found in request", 400);
    }

    // Find the course and lesson
    console.log('Looking for course with ID:', courseId);
    const course = await Course.findById(courseId);
    if (!course) {
        console.log('Course not found!');
        throw new AppError("Course not found", 404);
    }
    console.log('Course found:', course.title);

    let lesson = null;
    let unit = null;

    // Find lesson in units or direct lessons
    if (unitId) {
        console.log('Looking for unit with ID:', unitId);
        unit = course.units.id(unitId);
        if (!unit) {
            console.log('Unit not found!');
            console.log('Available units:', course.units.map(u => ({ id: u._id, title: u.title })));
            throw new AppError("Unit not found", 404);
        }
        console.log('Unit found:', unit.title);
        
        console.log('Looking for lesson with ID:', lessonId);
        lesson = unit.lessons.id(lessonId);
    } else {
        console.log('Looking for direct lesson with ID:', lessonId);
        lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) {
        console.log('Lesson not found!');
        if (unitId && unit) {
            console.log('Available lessons in unit:', unit.lessons.map(l => ({ id: l._id, title: l.title })));
        } else {
            console.log('Available direct lessons:', course.directLessons.map(l => ({ id: l._id, title: l.title })));
        }
        throw new AppError("Lesson not found", 404);
    }
    console.log('Lesson found:', lesson.title);

    // Find the specific exam by ID
    console.log('Looking for exam with ID:', examId);
    console.log('Available exams:', lesson.exams.map(e => ({ id: e._id, title: e.title })));
    const exam = lesson.exams.id(examId);
    if (!exam || !exam.questions || exam.questions.length === 0) {
        console.log('Exam not found or has no questions!');
        console.log('Exam found:', !!exam);
        console.log('Exam questions:', exam?.questions?.length || 0);
        throw new AppError("Exam not found or has no questions", 400);
    }
    console.log('Exam found:', exam.title, 'with', exam.questions.length, 'questions');

    // Check if exam is open based on dates
    const now = new Date();
    if (exam.openDate && now < new Date(exam.openDate)) {
        throw new AppError("Exam is not open yet", 400);
    }
    if (exam.closeDate && now > new Date(exam.closeDate)) {
        throw new AppError("Exam is closed", 400);
    }

    // Check if user has already taken this exam
    const existingAttempt = exam.userAttempts.find(attempt => 
        attempt.userId.toString() === userId.toString()
    );
    if (existingAttempt) {
        throw new AppError("You have already taken this exam", 400);
    }

    // Calculate results
    const questions = exam.questions;
    let correctAnswers = 0;
    const detailedAnswers = [];

    answers.forEach((answer) => {
        const question = questions[answer.questionIndex];
        if (!question) return;
        
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        
        if (isCorrect) {
            correctAnswers++;
        }

        detailedAnswers.push({
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            isCorrect
        });
    });

    const totalQuestions = questions.length;
    const score = correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Calculate time taken
    const endTime = new Date();
    let timeTaken = 0;
    
    if (startTime) {
        const start = new Date(startTime);
        timeTaken = Math.round((endTime - start) / 1000 / 60); // Convert to minutes
        console.log('⏱️ Final exam time calculation:', {
            startTime: start,
            endTime: endTime,
            timeTakenMinutes: timeTaken
        });
    } else {
        console.log('⚠️ No startTime provided for final exam, using timeTaken from request body');
        timeTaken = req.body.timeTaken || 0;
    }

    // Save attempt to exam
    const attempt = {
        userId,
        takenAt: endTime,
        score,
        totalQuestions,
        answers: detailedAnswers
    };

    exam.userAttempts.push(attempt);
    await course.save();

    res.status(201).json({
        success: true,
        message: "Exam completed successfully",
        data: {
            examType: 'final',
            examId: exam._id,
            courseId,
            lessonId,
            unitId: unitId || null,
            score,
            totalQuestions,
            percentage,
            correctAnswers,
            wrongAnswers: totalQuestions - correctAnswers,
            timeTaken: timeTaken,
            answers: detailedAnswers
        }
    });
});

// Get exam results for a lesson
const getExamResults = asyncHandler(async (req, res) => {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id || req.user.id;

    const results = await ExamResult.find({
        user: userId,
        course: courseId,
        lessonId
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: results
    });
});

// Get user's exam history
const getUserExamHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const results = await ExamResult.find({ user: userId })
        .populate('course', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await ExamResult.countDocuments({ user: userId });

    res.status(200).json({
        success: true,
        data: results,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            resultsPerPage: parseInt(limit)
        }
    });
});

// Check if user has taken an exam
const checkExamTaken = asyncHandler(async (req, res) => {
    const { courseId, lessonId, examType } = req.params;
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
        throw new AppError("User ID not found in request", 400);
    }

    const existingResult = await ExamResult.findOne({
        user: userId,
        course: courseId,
        lessonId,
        examType
    });

    res.status(200).json({
        success: true,
        data: {
            hasTaken: !!existingResult,
            result: existingResult
        }
    });
});

// Get exam statistics for admin
const getExamStatistics = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const stats = await ExamResult.aggregate([
        {
            $match: {
                course: courseId
            }
        },
        {
            $group: {
                _id: {
                    lessonId: "$lessonId",
                    examType: "$examType"
                },
                totalAttempts: { $sum: 1 },
                averageScore: { $avg: "$score" },
                passedCount: {
                    $sum: { $cond: ["$passed", 1, 0] }
                },
                failedCount: {
                    $sum: { $cond: ["$passed", 0, 1] }
                }
            }
        },
        {
            $group: {
                _id: "$_id.lessonId",
                exams: {
                    $push: {
                        examType: "$_id.examType",
                        totalAttempts: "$totalAttempts",
                        averageScore: "$averageScore",
                        passedCount: "$passedCount",
                        failedCount: "$failedCount"
                    }
                }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: stats
    });
});

// Get all exam results for admin dashboard
const getAllExamResults = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, courseId, examType, passed, sortBy = 'completedAt', sortOrder = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (courseId) filter.course = courseId;
    if (examType) filter.examType = examType;
    if (passed !== undefined) filter.passed = passed === 'true';
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const results = await ExamResult.find(filter)
        .populate('user', 'fullName email phoneNumber')
        .populate('course', 'title instructor stage subject')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
    
    const total = await ExamResult.countDocuments(filter);
    
    // Get summary statistics
    const summaryStats = await ExamResult.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                averageScore: { $avg: "$score" },
                passedCount: { $sum: { $cond: ["$passed", 1, 0] } },
                failedCount: { $sum: { $cond: ["$passed", 0, 1] } },
                averageTimeTaken: { $avg: "$timeTaken" }
            }
        }
    ]);
    
    const stats = summaryStats[0] || {
        totalAttempts: 0,
        averageScore: 0,
        passedCount: 0,
        failedCount: 0,
        averageTimeTaken: 0
    };
    
    res.status(200).json({
        success: true,
        data: results,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            resultsPerPage: parseInt(limit)
        },
        statistics: {
            totalAttempts: stats.totalAttempts,
            averageScore: Math.round(stats.averageScore * 100) / 100,
            passedCount: stats.passedCount,
            failedCount: stats.failedCount,
            passRate: stats.totalAttempts > 0 ? Math.round((stats.passedCount / stats.totalAttempts) * 100) : 0,
            averageTimeTaken: Math.round(stats.averageTimeTaken * 100) / 100
        }
    });
});

// Clear exam attempt for a specific user and exam
const clearExamAttempt = asyncHandler(async (req, res) => {
    const { courseId, lessonId, examId } = req.params;
    const userId = req.user._id || req.user.id;

    if (!userId) {
        throw new AppError("User ID not found in request", 400);
    }

    // Find the course and lesson
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    let lesson = null;
    let unit = null;

    // Find lesson in units or direct lessons
    if (req.query.unitId) {
        unit = course.units.id(req.query.unitId);
        if (!unit) {
            throw new AppError("Unit not found", 404);
        }
        lesson = unit.lessons.id(lessonId);
    } else {
        lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }

    // Find the specific exam by ID
    const exam = lesson.exams.id(examId);
    if (!exam) {
        throw new AppError("Exam not found", 404);
    }

    // Remove user attempts for this exam
    const initialLength = exam.userAttempts.length;
    exam.userAttempts = exam.userAttempts.filter(attempt => 
        attempt.userId.toString() !== userId.toString()
    );
    
    const removedCount = initialLength - exam.userAttempts.length;

    if (removedCount === 0) {
        return res.status(404).json({
            success: false,
            message: "No exam attempts found for this user"
        });
    }

    // Save the course
    await course.save();

    res.status(200).json({
        success: true,
        message: `Successfully cleared ${removedCount} exam attempt(s)`,
        data: {
            removedAttempts: removedCount,
            remainingAttempts: exam.userAttempts.length
        }
    });
});

export {
    takeTrainingExam,
    takeFinalExam,
    getExamResults,
    getUserExamHistory,
    getExamStatistics,
    checkExamTaken,
    clearExamAttempt
}; 