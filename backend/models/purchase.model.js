import { Schema, model } from "mongoose";

const purchaseSchema = new Schema({
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
    purchaseType: {
        type: String,
        enum: ['lesson', 'unit'],
        required: true
    },
    purchasedItemId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate purchases
purchaseSchema.index({ userId: 1, courseId: 1, purchaseType: 1, purchasedItemId: 1 }, { unique: true });

export default model("Purchase", purchaseSchema);
