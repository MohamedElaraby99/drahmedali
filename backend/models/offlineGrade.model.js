import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const offlineGradeSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional if student is not in system
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  quizName: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxScore: {
    type: Number,
    default: 100
  },
  percentage: {
    type: Number,
    default: function() {
      return (this.score / this.maxScore) * 100;
    }
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedByName: {
    type: String,
    required: true
  },
  uploadMethod: {
    type: String,
    enum: ['manual', 'excel_upload'],
    default: 'manual'
  },
  originalFileName: {
    type: String,
    required: false // Only for excel uploads
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  gradeDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
offlineGradeSchema.index({ groupId: 1, quizName: 1 });
offlineGradeSchema.index({ studentName: 1 });
offlineGradeSchema.index({ gradeDate: -1 });
offlineGradeSchema.index({ uploadedBy: 1 });

// Virtual for grade level
offlineGradeSchema.virtual('gradeLevel').get(function() {
  if (this.percentage >= 90) return 'ممتاز';
  if (this.percentage >= 80) return 'جيد جداً';
  if (this.percentage >= 70) return 'جيد';
  if (this.percentage >= 60) return 'مقبول';
  return 'ضعيف';
});

// Pre-save middleware to update percentage and lastModified
offlineGradeSchema.pre('save', function(next) {
  this.percentage = (this.score / this.maxScore) * 100;
  this.lastModified = new Date();
  next();
});

// Add pagination plugin
offlineGradeSchema.plugin(mongoosePaginate);

export default mongoose.model('OfflineGrade', offlineGradeSchema);
