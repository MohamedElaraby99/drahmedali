import { model, Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const groupSchema = new Schema({
  name: {
    type: String,
    required: [true, "اسم المجموعة مطلوب"],
    trim: true,
    unique: true
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'Instructor',
    required: [true, "المدرس مطلوب"]
  },
  price: {
    type: Number,
    required: [true, "سعر المجموعة مطلوب"],
    min: [0, "السعر يجب أن يكون أكبر من أو يساوي صفر"]
  },
  maxStudents: {
    type: Number,
    default: 15,
    min: [1, "الحد الأقصى للطلاب يجب أن يكون أكبر من صفر"]
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: [0, "عدد الطلاب الحالي يجب أن يكون أكبر من أو يساوي صفر"]
  },
  monthlyPayment: {
    enabled: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      min: [0, "السعر الشهري يجب أن يكون أكبر من أو يساوي صفر"]
    },
    dueDay: {
      type: Number,
      min: [1, "يوم الاستحقاق يجب أن يكون بين 1 و 31"],
      max: [31, "يوم الاستحقاق يجب أن يكون بين 1 و 31"],
      default: 1
    }
  },
  weeklySchedule: {
    saturday: {
      enabled: { type: Boolean, default: false },
      timeSlots: [{
        hour: { type: Number, min: 0, max: 23, required: true },
        minute: { type: Number, min: 0, max: 59, required: true },
        period: { type: String, enum: ['AM', 'PM'], required: true },
        duration: { type: Number, min: 30, max: 180, default: 60 }
      }]
    },
    sunday: {
      enabled: { type: Boolean, default: false },
      timeSlots: [{
        hour: { type: Number, min: 0, max: 23, required: true },
        minute: { type: Number, min: 0, max: 59, required: true },
        period: { type: String, enum: ['AM', 'PM'], required: true },
        duration: { type: Number, min: 30, max: 180, default: 60 }
      }]
    },
    monday: {
      enabled: { type: Boolean, default: false },
      timeSlots: [{
        hour: { type: Number, min: 0, max: 23, required: true },
        minute: { type: Number, min: 0, max: 59, required: true },
        period: { type: String, enum: ['AM', 'PM'], required: true },
        duration: { type: Number, min: 30, max: 180, default: 60 }
      }]
    },
    tuesday: {
      enabled: { type: Boolean, default: false },
      timeSlots: [{
        hour: { type: Number, min: 0, max: 23, required: true },
        minute: { type: Number, min: 0, max: 59, required: true },
        period: { type: String, enum: ['AM', 'PM'], required: true },
        duration: { type: Number, min: 30, max: 180, default: 60 }
      }]
    },
    wednesday: {
      enabled: { type: Boolean, default: false },
      timeSlots: [{
        hour: { type: Number, min: 0, max: 23, required: true },
        minute: { type: Number, min: 0, max: 59, required: true },
        period: { type: String, enum: ['AM', 'PM'], required: true },
        duration: { type: Number, min: 30, max: 180, default: 60 }
      }]
    },
    thursday: {
      enabled: { type: Boolean, default: false },
      timeSlots: [{
        hour: { type: Number, min: 0, max: 23, required: true },
        minute: { type: Number, min: 0, max: 59, required: true },
        period: { type: String, enum: ['AM', 'PM'], required: true },
        duration: { type: Number, min: 30, max: 180, default: 60 }
      }]
    },
    friday: {
      enabled: { type: Boolean, default: false },
      timeSlots: [{
        hour: { type: Number, min: 0, max: 23, required: true },
        minute: { type: Number, min: 0, max: 59, required: true },
        period: { type: String, enum: ['AM', 'PM'], required: true },
        duration: { type: Number, min: 30, max: 180, default: 60 }
      }]
    }
  },
  subjects: [{
    type: Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add pagination plugin
groupSchema.plugin(mongoosePaginate);

// Index for better performance
groupSchema.index({ name: 1 });
groupSchema.index({ instructor: 1 });
groupSchema.index({ status: 1 });
groupSchema.index({ createdAt: -1 });

// Virtual for available spots
groupSchema.virtual('availableSpots').get(function() {
  return this.maxStudents - this.currentStudents;
});

// Ensure virtual fields are serialized
groupSchema.set('toJSON', { virtuals: true });
groupSchema.set('toObject', { virtuals: true });

const Group = model('Group', groupSchema);
export default Group;
