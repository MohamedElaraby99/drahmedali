import { model, Schema } from "mongoose";
import { getCairoNow } from '../utils/timezone.js';

const examResultSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    examType: {
        type: String,
        enum: ['training', 'final'],
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    correctAnswers: {
        type: Number,
        required: true
    },
    wrongAnswers: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number, // in minutes
        required: true
    },
    timeLimit: {
        type: Number, // in minutes
        required: true
    },
    passingScore: {
        type: Number,
        required: true
    },
    passed: {
        type: Boolean,
        required: true
    },
    answers: [
        {
            questionIndex: {
                type: Number,
                required: true
            },
            selectedAnswer: {
                type: Number,
                required: true
            },
            correctAnswer: {
                type: Number,
                required: true
            },
            isCorrect: {
                type: Boolean,
                required: true
            }
        }
    ],
    completedAt: {
        type: Date,
        default: getCairoNow
    }
}, {
    timestamps: true
});

// Index for better query performance
examResultSchema.index({ user: 1, course: 1, lessonId: 1, examType: 1 }, { unique: true });
examResultSchema.index({ user: 1 });
examResultSchema.index({ course: 1 });

const ExamResult = model("ExamResult", examResultSchema);

export default ExamResult; 