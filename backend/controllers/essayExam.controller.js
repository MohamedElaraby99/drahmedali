import EssayExam from "../models/essayExam.model.js";
import Course from "../models/course.model.js";
import AppError from "../utils/error.utils.js";

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Create essay exam
const createEssayExam = asyncHandler(async (req, res) => {
    const { courseId, lessonId, unitId, title, description, questions, timeLimit, openDate, closeDate, allowLateSubmission, lateSubmissionPenalty } = req.body;
    
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

    // Create essay exam
    const essayExam = new EssayExam({
        course: courseId,
        lessonId,
        lessonTitle: lesson.title,
        unitId: unitId || null,
        unitTitle: unit?.title || null,
        title,
        description: description || '',
        questions: questions || [],
        timeLimit: timeLimit || 60,
        openDate: openDate || null,
        closeDate: closeDate || null,
        allowLateSubmission: allowLateSubmission || false,
        lateSubmissionPenalty: lateSubmissionPenalty || 10
    });

    await essayExam.save();

    res.status(201).json({
        success: true,
        message: "Essay exam created successfully",
        data: essayExam
    });
});

// Get essay exams for a lesson
const getEssayExams = asyncHandler(async (req, res) => {
    const { courseId, lessonId } = req.params;
    const { unitId } = req.query;

    const filter = {
        course: courseId,
        lessonId,
        isActive: true
    };

    if (unitId) {
        filter.unitId = unitId;
    }

    const essayExams = await EssayExam.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: essayExams
    });
});

// Get essay exam by ID
const getEssayExamById = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const userId = req.user._id || req.user.id;

    const essayExam = await EssayExam.findById(examId);
    if (!essayExam) {
        throw new AppError("Essay exam not found", 404);
    }

    // Check if exam is open
    const now = new Date();
    if (essayExam.openDate && now < new Date(essayExam.openDate)) {
        throw new AppError("Essay exam is not open yet", 400);
    }
    if (essayExam.closeDate && now > new Date(essayExam.closeDate)) {
        throw new AppError("Essay exam is closed", 400);
    }

    // Check if user has already submitted
    const userSubmission = essayExam.submissions.find(s => 
        s.user.toString() === userId.toString()
    );

    res.status(200).json({
        success: true,
        data: {
            exam: essayExam,
            userSubmission: userSubmission || null
        }
    });
});

// Submit essay exam
const submitEssayExam = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id || req.user.id;

    const essayExam = await EssayExam.findById(examId);
    if (!essayExam) {
        throw new AppError("Essay exam not found", 404);
    }

    // Check if exam is open
    const now = new Date();
    if (essayExam.openDate && now < new Date(essayExam.openDate)) {
        throw new AppError("Essay exam is not open yet", 400);
    }
    if (essayExam.closeDate && now > new Date(essayExam.closeDate)) {
        if (!essayExam.allowLateSubmission) {
            throw new AppError("Essay exam is closed", 400);
        }
    }

    // Check if user has already submitted
    const existingSubmission = essayExam.submissions.find(s => 
        s.user.toString() === userId.toString()
    );
    if (existingSubmission) {
        throw new AppError("You have already submitted this essay exam", 400);
    }

    // Process answers
    for (const answer of answers) {
        const { questionIndex, textAnswer, fileAnswer } = answer;
        
        // Validate question exists
        if (questionIndex >= essayExam.questions.length) {
            throw new AppError(`Invalid question index: ${questionIndex}`, 400);
        }

        // Add submission
        essayExam.addSubmission(userId, questionIndex, textAnswer, fileAnswer);
    }

    await essayExam.save();

    res.status(201).json({
        success: true,
        message: "Essay exam submitted successfully",
        data: {
            examId: essayExam._id,
            submittedAt: new Date()
        }
    });
});

// Get essay exam submissions (for admin/instructor)
const getEssayExamSubmissions = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const { page = 1, limit = 20, status, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

    const essayExam = await EssayExam.findById(examId)
        .populate('submissions.user', 'fullName email phoneNumber')
        .populate('submissions.gradedBy', 'fullName');

    if (!essayExam) {
        throw new AppError("Essay exam not found", 404);
    }

    // Filter submissions
    let submissions = essayExam.submissions;
    if (status) {
        submissions = submissions.filter(s => s.status === status);
    }

    // Sort submissions
    submissions.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'desc') {
            return bValue - aValue;
        }
        return aValue - bValue;
    });

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedSubmissions = submissions.slice(skip, skip + parseInt(limit));

    res.status(200).json({
        success: true,
        data: {
            exam: {
                _id: essayExam._id,
                title: essayExam.title,
                description: essayExam.description,
                questions: essayExam.questions,
                totalSubmissions: essayExam.totalSubmissions,
                gradedSubmissions: essayExam.gradedSubmissions,
                averageGrade: essayExam.averageGrade
            },
            submissions: paginatedSubmissions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(submissions.length / limit),
                totalResults: submissions.length,
                resultsPerPage: parseInt(limit)
            }
        }
    });
});

// Grade essay submission
const gradeEssaySubmission = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const { userId, questionIndex, grade, feedback } = req.body;
    const gradedBy = req.user._id || req.user.id;

    const essayExam = await EssayExam.findById(examId);
    if (!essayExam) {
        throw new AppError("Essay exam not found", 404);
    }

    // Validate grade
    if (grade < 0 || grade > 100) {
        throw new AppError("Grade must be between 0 and 100", 400);
    }

    // Grade the submission
    const gradedSubmission = essayExam.gradeSubmission(userId, questionIndex, grade, feedback, gradedBy);
    
    await essayExam.save();

    res.status(200).json({
        success: true,
        message: "Essay submission graded successfully",
        data: gradedSubmission
    });
});

// Get user's essay exam submissions
const getUserEssaySubmissions = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const essayExams = await EssayExam.find({
        'submissions.user': userId
    })
    .populate('course', 'title instructor')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await EssayExam.countDocuments({
        'submissions.user': userId
    });

    // Extract user submissions from each exam
    const userSubmissions = [];
    essayExams.forEach(exam => {
        const userSubmission = exam.submissions.find(s => 
            s.user.toString() === userId.toString()
        );
        if (userSubmission) {
            userSubmissions.push({
                exam: {
                    _id: exam._id,
                    title: exam.title,
                    course: exam.course,
                    lessonTitle: exam.lessonTitle,
                    unitTitle: exam.unitTitle
                },
                submission: userSubmission
            });
        }
    });

    res.status(200).json({
        success: true,
        data: userSubmissions,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            resultsPerPage: parseInt(limit)
        }
    });
});

// Update essay exam
const updateEssayExam = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const updateData = req.body;

    const essayExam = await EssayExam.findById(examId);
    if (!essayExam) {
        throw new AppError("Essay exam not found", 404);
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== 'submissions' && key !== 'totalSubmissions' && key !== 'gradedSubmissions' && key !== 'averageGrade') {
            essayExam[key] = updateData[key];
        }
    });

    await essayExam.save();

    res.status(200).json({
        success: true,
        message: "Essay exam updated successfully",
        data: essayExam
    });
});

// Delete essay exam
const deleteEssayExam = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    const essayExam = await EssayExam.findById(examId);
    if (!essayExam) {
        throw new AppError("Essay exam not found", 404);
    }

    // Soft delete by setting isActive to false
    essayExam.isActive = false;
    await essayExam.save();

    res.status(200).json({
        success: true,
        message: "Essay exam deleted successfully"
    });
});

// Get essay exam statistics
const getEssayExamStatistics = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const stats = await EssayExam.aggregate([
        {
            $match: {
                course: courseId,
                isActive: true
            }
        },
        {
            $group: {
                _id: {
                    lessonId: "$lessonId",
                    lessonTitle: "$lessonTitle"
                },
                totalExams: { $sum: 1 },
                totalSubmissions: { $sum: "$totalSubmissions" },
                gradedSubmissions: { $sum: "$gradedSubmissions" },
                averageGrade: { $avg: "$averageGrade" }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: stats
    });
});

export {
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
};
