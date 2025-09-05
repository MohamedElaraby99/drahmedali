import { model, Schema } from "mongoose";

const subjectSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Subject title is required'],
        trim: true,
        maxLength: [100, 'Subject title should be less than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Subject description is required'],
        maxLength: [500, 'Subject description should be less than 500 characters']
    },
    instructor: {
        type: Schema.Types.ObjectId,
        ref: 'Instructor',
        required: [true, 'Instructor is required']
    },
    image: {
        public_id: {
            type: String,
            default: null
        },
        secure_url: {
            type: String,
            default: null
        }
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create index for better search performance
subjectSchema.index({ title: 'text', description: 'text' });

export default model('Subject', subjectSchema); 