import { model, Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';
import { getCairoNow, toCairoTime } from '../utils/timezone.js';

const attendanceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: false // Optional for general attendance
  },
  liveMeeting: {
    type: Schema.Types.ObjectId,
    ref: 'LiveMeeting',
    required: false // Optional for general attendance
  },
  attendanceType: {
    type: String,
    enum: ['course', 'live_meeting', 'general'],
    default: 'general'
  },
  scannedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true // The instructor/admin who scanned the QR code
  },
  scanLocation: {
    type: String,
    required: false // Optional location info
  },
  scanMethod: {
    type: String,
    enum: ['qr_code', 'manual'],
    default: 'qr_code'
  },
  qrData: {
    type: Object,
    required: false // Store the original QR code data for verification
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent'],
    default: 'present'
  },
  notes: {
    type: String,
    required: false
  },
  attendanceDate: {
    type: Date,
    default: getCairoNow
  },
  isValid: {
    type: Boolean,
    default: true
  },
  invalidReason: {
    type: String,
    required: false
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
attendanceSchema.index({ user: 1, attendanceDate: -1 });
attendanceSchema.index({ course: 1, attendanceDate: -1 });
attendanceSchema.index({ liveMeeting: 1, attendanceDate: -1 });
attendanceSchema.index({ scannedBy: 1, attendanceDate: -1 });
attendanceSchema.index({ attendanceType: 1, attendanceDate: -1 });
attendanceSchema.index({ 'qrData.phoneNumber': 1 }); // Index for phone number searches
attendanceSchema.index({ 'qrData.userId': 1 }); // Index for user ID searches

// Compound index to prevent duplicate attendance for same course/meeting on same day
attendanceSchema.index({ 
  user: 1, 
  course: 1, 
  attendanceDate: { $dateToString: { format: "%Y-%m-%d", date: "$attendanceDate" } }
}, { 
  unique: true, 
  partialFilterExpression: { course: { $exists: true } }
});

attendanceSchema.index({ 
  user: 1, 
  liveMeeting: 1, 
  attendanceDate: { $dateToString: { format: "%Y-%m-%d", date: "$attendanceDate" } }
}, { 
  unique: true, 
  partialFilterExpression: { liveMeeting: { $exists: true } }
});

// Virtual for formatted attendance date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.attendanceDate.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to check if attendance is recent (within last 24 hours)
attendanceSchema.methods.isRecent = function() {
  const now = getCairoNow();
  const attendanceTime = toCairoTime(this.attendanceDate);
  const diffInHours = (now - attendanceTime) / (1000 * 60 * 60);
  return diffInHours <= 24;
};

// Method to mark as invalid
attendanceSchema.methods.markInvalid = function(reason) {
  this.isValid = false;
  this.invalidReason = reason;
  return this.save();
};

// Static method to get attendance statistics
attendanceSchema.statics.getAttendanceStats = async function(userId, startDate, endDate) {
  const matchQuery = { user: userId, isValid: true };
  
  if (startDate && endDate) {
    matchQuery.attendanceDate = {
      $gte: toCairoTime(startDate),
      $lte: toCairoTime(endDate)
    };
  }

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalAttendance: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        lateCount: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
        absentCount: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
        courseAttendance: { $sum: { $cond: [{ $eq: ["$attendanceType", "course"] }, 1, 0] } },
        meetingAttendance: { $sum: { $cond: [{ $eq: ["$attendanceType", "live_meeting"] }, 1, 0] } },
        generalAttendance: { $sum: { $cond: [{ $eq: ["$attendanceType", "general"] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    totalAttendance: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    courseAttendance: 0,
    meetingAttendance: 0,
    generalAttendance: 0
  };
};

// Add pagination plugin
attendanceSchema.plugin(mongoosePaginate);

const Attendance = model('Attendance', attendanceSchema);

export default Attendance;
