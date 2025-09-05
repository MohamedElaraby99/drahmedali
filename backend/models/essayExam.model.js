import { model, Schema } from "mongoose";
import { getCairoNow } from '../utils/timezone.js';

const essaySubmissionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionIndex: {
        type: Number,
        required: true
    },
    textAnswer: {
        type: String,
        default: ''
    },
    fileAnswer: {
        url: String,
        fileName: String,
        fileType: String
    },
    submittedAt: {
        type: Date,
        default: getCairoNow
    },
    gradedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    grade: {
        type: Number,
        min: 0,
        max: 100
    },
    feedback: {
        type: String,
        default: ''
    },
    gradedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['submitted', 'graded', 'late'],
        default: 'submitted'
    }
});

const essayExamSchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lessonId: {
        type: String,
        required: true
    },
    lessonTitle: {
        type: String,
        required: true
    },
    unitId: {
        type: String,
        default: null
    },
    unitTitle: {
        type: String,
        default: null
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        maxGrade: {
            type: Number,
            default: 100
        },
        allowFileUpload: {
            type: Boolean,
            default: false
        },
        allowedFileTypes: [{
            type: String,
            enum: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif']
        }],
        maxFileSize: {
            type: Number, // in MB
            default: 10
        },
        image: {
            type: String,
            default: ''
        }
    }],
    timeLimit: {
        type: Number, // in minutes
        default: 60
    },
    openDate: {
        type: Date
    },
    closeDate: {
        type: Date
    },
    allowLateSubmission: {
        type: Boolean,
        default: false
    },
    lateSubmissionPenalty: {
        type: Number, // percentage deduction
        default: 10
    },
    submissions: [essaySubmissionSchema],
    totalSubmissions: {
        type: Number,
        default: 0
    },
    gradedSubmissions: {
        type: Number,
        default: 0
    },
    averageGrade: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
essayExamSchema.index({ course: 1, lessonId: 1 });
essayExamSchema.index({ 'submissions.user': 1 });
essayExamSchema.index({ isActive: 1 });

// Virtual for calculating completion rate
essayExamSchema.virtual('completionRate').get(function() {
    if (this.totalSubmissions === 0) return 0;
    return Math.round((this.gradedSubmissions / this.totalSubmissions) * 100);
});

// Method to add submission
essayExamSchema.methods.addSubmission = function(userId, questionIndex, textAnswer, fileAnswer) {
    const submission = {
        user: userId,
        questionIndex,
        textAnswer: textAnswer || '',
        fileAnswer: fileAnswer || null,
        submittedAt: getCairoNow(),
        status: 'submitted'
    };
    
    this.submissions.push(submission);
    this.totalSubmissions += 1;
    
    return submission;
};

// Method to grade submission
essayExamSchema.methods.gradeSubmission = function(userId, questionIndex, grade, feedback, gradedBy) {
    const submission = this.submissions.find(s => 
        s.user.toString() === userId.toString() && 
        s.questionIndex === questionIndex
    );
    
    if (!submission) {
        throw new Error('Submission not found');
    }
    
    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.gradedBy = gradedBy;
    submission.gradedAt = getCairoNow();
    submission.status = 'graded';
    
    // Update statistics
    this.gradedSubmissions += 1;
    
    // Recalculate average grade
    const gradedSubmissions = this.submissions.filter(s => s.status === 'graded');
    if (gradedSubmissions.length > 0) {
        this.averageGrade = gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length;
    }
    
    return submission;
};

const EssayExam = model("EssayExam", essayExamSchema);

export default EssayExam;
