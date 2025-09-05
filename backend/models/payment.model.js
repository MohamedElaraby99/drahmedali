import { model, Schema } from "mongoose";

const paymentSchema = new Schema({
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
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'EGP'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
    },
    paymentMethod: {
        type: String,
        default: 'course_purchase'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    description: {
        type: String,
        default: 'Course purchase'
    },
    metadata: {
        courseTitle: String,
        coursePrice: Number,
        userEmail: String,
        userName: String
    }
}, {
        timestamps: true
});

// Index for better query performance
paymentSchema.index({ user: 1, course: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: 1 });

const Payment = model("Payment", paymentSchema);

export default Payment; 