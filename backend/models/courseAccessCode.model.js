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

// Validate a code can be redeemed
courseAccessCodeSchema.statics.findRedeemable = function (code) {
    return this.findOne({
        code,
        isUsed: false,
        codeExpiresAt: { $gt: new Date() }
    });
};

export default model('CourseAccessCode', courseAccessCodeSchema);


