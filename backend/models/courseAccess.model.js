import { Schema, model } from "mongoose";

const courseAccessSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    accessStartAt: {
        type: Date,
        default: Date.now
    },
    accessEndAt: {
        type: Date,
        required: true
    },
    source: {
        type: String,
        enum: ['code'],
        default: 'code'
    },
    codeId: {
        type: Schema.Types.ObjectId,
        ref: 'CourseAccessCode'
    }
}, { timestamps: true });

// Prevent overlapping duplicates for same user/course if still active
courseAccessSchema.index({ userId: 1, courseId: 1, accessEndAt: -1 });

export default model('CourseAccess', courseAccessSchema);


