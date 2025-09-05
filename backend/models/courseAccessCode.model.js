import { Schema, model } from "mongoose";
import { getCairoNow, addCairoTime } from '../utils/timezone.js';

const courseAccessCodeSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // Fixed access window (required for each code)
    accessStartAt: { type: Date, required: true },
    accessEndAt: { type: Date, required: true },
    // Optional: when the code itself expires if not redeemed
    codeExpiresAt: {
        type: Date,
        default: function () {
            // Default: 90 days
            return addCairoTime(getCairoNow(), 90, 'days');
        }
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    usedAt: {
        type: Date,
        default: null
    },
    // Track usage history for reusable codes
    usageHistory: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        usedAt: {
            type: Date,
            default: Date.now
        },
        videoId: {
            type: Schema.Types.ObjectId,
            required: false
        },
        lessonId: {
            type: Schema.Types.ObjectId,
            required: false
        }
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Generate a unique human-friendly code
courseAccessCodeSchema.statics.generateCode = function () {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
        code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return code;
};

// Validate a code can be redeemed (allows reuse during access window)
courseAccessCodeSchema.statics.findRedeemable = function (code) {
    const now = new Date();
    return this.findOne({
        code,
        codeExpiresAt: { $gt: now },
        // Allow reuse if we're within the access window
        $or: [
            { isUsed: false }, // Never used
            { 
                isUsed: true,
                accessEndAt: { $gt: now } // Used but still within access window
            }
        ]
    });
};

export default model('CourseAccessCode', courseAccessCodeSchema);


