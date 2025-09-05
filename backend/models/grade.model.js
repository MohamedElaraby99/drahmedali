import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
gradeSchema.index({ name: 1 });
gradeSchema.index({ isActive: 1 });

export default mongoose.model('Grade', gradeSchema); 