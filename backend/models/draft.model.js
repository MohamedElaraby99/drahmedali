import mongoose from 'mongoose';

const { Schema } = mongoose;

const DraftSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'course', required: true, index: true },
  unit: { type: Schema.Types.ObjectId, ref: 'unit', required: false, index: true },
  lesson: { type: Schema.Types.ObjectId, required: true, index: true },
  type: { type: String, enum: ['exam', 'training', 'essay-exam'], required: true, index: true },
  status: { type: String, enum: ['draft'], default: 'draft' },
  data: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

DraftSchema.index({ user: 1, course: 1, unit: 1, lesson: 1, type: 1 }, { unique: false });

export default mongoose.model('draft', DraftSchema);


