import { model, Schema } from "mongoose";

const qaSchema = new Schema({
    question: {
        type: String,
        required: [true, 'Question is required'],
        minLength: [10, 'Question must be at least 10 characters'],
        maxLength: [500, 'Question should be less than 500 characters']
    },
    answer: {
        type: String,
        required: false,
        minLength: [10, 'Answer must be at least 10 characters'],
        maxLength: [2000, 'Answer should be less than 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['General', 'Technical', 'Course Related', 'Payment', 'Account', 'Other']
    },
    author: {
        type: String,
        required: [true, 'Author is required']
    },
    status: {
        type: String,
        enum: ['pending', 'answered', 'featured'],
        default: 'pending'
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Create index for better search performance
qaSchema.index({ question: 'text', answer: 'text' });

const QA = model("QA", qaSchema);

export default QA; 