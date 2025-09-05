import mongoose from 'mongoose';

const centerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Center name is required'],
    trim: true,
    maxLength: [100, 'Center name must be less than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description must be less than 500 characters']
  },
  location: {
    type: String,
    trim: true,
    maxLength: [200, 'Location must be less than 200 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxLength: [20, 'Phone must be less than 20 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  capacity: {
    type: Number,
    default: 0,
    min: [0, 'Capacity cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
centerSchema.index({ name: 1 });
centerSchema.index({ isActive: 1 });

export default mongoose.model('Center', centerSchema);
