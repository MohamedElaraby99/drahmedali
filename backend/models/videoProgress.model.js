import { Schema, model } from "mongoose";

const videoProgressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  currentTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0, // Percentage (0-100)
    min: 0,
    max: 100
  },
  reachedPercentages: [{
    percentage: {
      type: Number,
      required: true
    },
    time: {
      type: Number,
      required: true
    },
    reachedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  lastWatched: {
    type: Date,
    default: Date.now
  },
  totalWatchTime: {
    type: Number,
    default: 0 // Total seconds watched
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress record per user per video
videoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

// Method to update progress
videoProgressSchema.methods.updateProgress = function(currentTime, duration) {
  this.currentTime = currentTime;
  this.duration = duration;
  this.progress = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
  this.lastWatched = new Date();
  
  // Check if video is completed (watched 90% or more)
  if (this.progress >= 90) {
    this.isCompleted = true;
  }
  
  return this.save();
};

// Method to add watch time
videoProgressSchema.methods.addWatchTime = function(seconds) {
  this.totalWatchTime += seconds;
  return this.save();
};

export default model("VideoProgress", videoProgressSchema); 