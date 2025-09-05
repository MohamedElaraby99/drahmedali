import { Schema, model } from 'mongoose';

const notificationReadSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notificationId: {
    type: String,
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
notificationReadSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

export default model('NotificationRead', notificationReadSchema);
