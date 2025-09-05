import { model, Schema } from "mongoose";

const blogSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minLength: [5, 'Title must be at least 5 characters'],
        maxLength: [100, 'Title should be less than 100 characters'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        minLength: [10, 'Content must be at least 10 characters'],
        maxLength: [5000, 'Content should be less than 5000 characters']
    },
    excerpt: {
        type: String,
        required: [true, 'Excerpt is required'],
        maxLength: [200, 'Excerpt should be less than 200 characters']
    },
    image: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    author: {
        type: String,
        required: [true, 'Author is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Technology', 'Education', 'Programming', 'Design', 'Business', 'Other']
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create index for better search performance
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

const Blog = model("Blog", blogSchema);

export default Blog; 