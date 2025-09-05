import { Schema, model } from 'mongoose';
import { getCairoNow, toCairoTime } from '../utils/timezone.js';

const liveMeetingSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxLength: [200, 'Title should be less than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Meeting description is required'],
    trim: true,
    maxLength: [1000, 'Description should be less than 1000 characters']
  },
  googleMeetLink: {
    type: String,
    required: [true, 'Google Meet link is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https:\/\/meet\.google\.com\/[a-z0-9\-]+$/i.test(v);
      },
      message: 'Please provide a valid Google Meet link'
    }
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Meeting duration is required'],
    min: [15, 'Minimum duration is 15 minutes'],
    max: [480, 'Maximum duration is 8 hours (480 minutes)']
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'Instructor',
    required: [true, 'Instructor is required']
  },
  stage: {
    type: Schema.Types.ObjectId,
    ref: 'Stage',
    required: [true, 'Stage is required']
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  attendees: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    hasJoined: {
      type: Boolean,
      default: false
    },
    joinedAt: {
      type: Date
    }
  }],
  maxAttendees: {
    type: Number,
    default: 100,
    min: [1, 'At least 1 attendee is required'],
    max: [500, 'Maximum 500 attendees allowed']
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  recordingLink: {
    type: String,
    trim: true
  },
  isRecorded: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
liveMeetingSchema.index({ scheduledDate: 1, status: 1 });
liveMeetingSchema.index({ stage: 1, subject: 1 });
liveMeetingSchema.index({ 'attendees.user': 1 });

// Virtual for getting attendees count
liveMeetingSchema.virtual('attendeesCount').get(function() {
  return this.attendees.length;
});

// Virtual for getting joined attendees count
liveMeetingSchema.virtual('joinedAttendeesCount').get(function() {
  return this.attendees.filter(attendee => attendee.hasJoined).length;
});

// Method to check if meeting is upcoming
liveMeetingSchema.methods.isUpcoming = function() {
  return this.scheduledDate > new Date() && this.status === 'scheduled';
};

// Method to check if user is attendee
liveMeetingSchema.methods.isUserAttendee = function(userId) {
  const userIdStr = userId.toString();
  return this.attendees.some(attendee => {
    // Handle both populated and non-populated attendee.user
    const attendeeUserId = attendee.user._id ? attendee.user._id.toString() : attendee.user.toString();
    return attendeeUserId === userIdStr;
  });
};

// Method to add attendee
liveMeetingSchema.methods.addAttendee = function(userId) {
  if (!this.isUserAttendee(userId) && this.attendees.length < this.maxAttendees) {
    this.attendees.push({ user: userId });
    return true;
  }
  return false;
};

// Method to remove attendee
liveMeetingSchema.methods.removeAttendee = function(userId) {
  const userIdStr = userId.toString();
  const index = this.attendees.findIndex(attendee => {
    // Handle both populated and non-populated attendee.user
    const attendeeUserId = attendee.user._id ? attendee.user._id.toString() : attendee.user.toString();
    return attendeeUserId === userIdStr;
  });
  if (index > -1) {
    this.attendees.splice(index, 1);
    return true;
  }
  return false;
};

// Pre-save middleware to update status based on time
liveMeetingSchema.pre('save', function(next) {
  const now = getCairoNow();
  const scheduledTime = toCairoTime(this.scheduledDate);
  const endTime = new Date(scheduledTime.getTime() + (this.duration * 60000));

  if (now >= scheduledTime && now <= endTime && this.status === 'scheduled') {
    this.status = 'live';
  } else if (now > endTime && (this.status === 'live' || this.status === 'scheduled')) {
    this.status = 'completed';
  }

  next();
});

const LiveMeeting = model('LiveMeeting', liveMeetingSchema);

export default LiveMeeting;
