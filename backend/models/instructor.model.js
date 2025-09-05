import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  specialization: {
    type: String,
    trim: true,
    default: ''
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  education: {
    type: String,
    trim: true,
    default: ''
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true,
      default: ''
    },
    twitter: {
      type: String,
      trim: true,
      default: ''
    },
    facebook: {
      type: String,
      trim: true,
      default: ''
    },
    whatsapp: {
      type: String,
      trim: true,
      default: ''
    }
  },
  profileImage: {
    public_id: {
      type: String,
      default: ''
    },
    secure_url: {
      type: String,
      default: ''
    }
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: []
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
instructorSchema.index({ name: 1 });
instructorSchema.index({ specialization: 1 });
instructorSchema.index({ isActive: 1 });
instructorSchema.index({ featured: 1 });

export default mongoose.model('Instructor', instructorSchema); 