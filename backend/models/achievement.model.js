import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان الإنجاز مطلوب'],
    trim: true,
    maxlength: [100, 'عنوان الإنجاز لا يمكن أن يتجاوز 100 حرف']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'وصف الإنجاز لا يمكن أن يتجاوز 500 حرف']
  },
  category: {
    type: String,
    required: [true, 'فئة الإنجاز مطلوبة'],
    enum: {
      values: ['academic', 'attendance', 'behavior', 'sports', 'overall'],
      message: 'فئة الإنجاز يجب أن تكون: أكاديمي، حضور، سلوك، رياضة، أو شامل'
    }
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف الطالب مطلوب']
  },
  studentName: {
    type: String,
    required: [true, 'اسم الطالب مطلوب']
  },
  points: {
    type: Number,
    required: [true, 'النقاط مطلوبة'],
    min: [0, 'النقاط لا يمكن أن تكون سالبة']
  },
  maxPoints: {
    type: Number,
    default: 100
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  achievementType: {
    type: String,
    enum: ['manual', 'auto_generated'],
    default: 'manual'
  },
  criteria: {
    totalQuizScore: {
      type: Number,
      default: 0
    },
    totalQuizCount: {
      type: Number,
      default: 0
    },
    averageQuizScore: {
      type: Number,
      default: 0
    },
    attendanceRate: {
      type: Number,
      default: 0
    },
    totalAttendanceDays: {
      type: Number,
      default: 0
    },
    consecutiveAttendanceDays: {
      type: Number,
      default: 0
    }
  },
  awardedAt: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف المستخدم الذي أضاف الإنجاز مطلوب']
  },
  uploadedByName: {
    type: String,
    required: [true, 'اسم المستخدم الذي أضاف الإنجاز مطلوب']
  },
  icon: {
    type: String,
    default: '🏆'
  },
  level: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  groupName: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for grade level based on percentage
achievementSchema.virtual('gradeLevel').get(function() {
  if (this.percentage >= 95) return 'ممتاز';
  if (this.percentage >= 85) return 'جيد جداً';
  if (this.percentage >= 75) return 'جيد';
  if (this.percentage >= 65) return 'مقبول';
  return 'ضعيف';
});

// Index for better query performance
achievementSchema.index({ studentId: 1, category: 1, status: 1 });
achievementSchema.index({ category: 1, status: 1 });
achievementSchema.index({ uploadedBy: 1 });
achievementSchema.index({ groupId: 1 });

// Pre-save middleware to calculate percentage
achievementSchema.pre('save', function(next) {
  if (this.points && this.maxPoints) {
    this.percentage = Math.round((this.points / this.maxPoints) * 100);
  }
  
  // Auto-assign level based on points
  if (this.points >= 90) this.level = 'diamond';
  else if (this.points >= 80) this.level = 'platinum';
  else if (this.points >= 70) this.level = 'gold';
  else if (this.points >= 60) this.level = 'silver';
  else this.level = 'bronze';
  
  next();
});

export default mongoose.model('Achievement', achievementSchema);
