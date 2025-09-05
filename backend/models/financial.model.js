import { model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { getCairoNow } from '../utils/timezone.js';

const financialSchema = new Schema({
  type: {
    type: String,
    required: [true, "نوع المعاملة مطلوب"],
    enum: ['income', 'expense'],
    default: 'income'
  },
  amount: {
    type: Number,
    required: [true, "المبلغ مطلوب"],
    min: [0, "المبلغ يجب أن يكون أكبر من أو يساوي صفر"]
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    trim: true,
    default: ''
  },
  // For income transactions
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.type === 'income';
    }
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: function() {
      return this.type === 'income';
    }
  },
  // For expense transactions
  expenseCategory: {
    type: String,
    enum: ['salary', 'rent', 'utilities', 'supplies', 'marketing', 'other'],
    required: function() {
      return this.type === 'expense';
    }
  },
  // Common fields
  transactionDate: {
    type: Date,
    default: getCairoNow
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'card', 'other'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  // Reference to who created this transaction
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Additional notes
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  // Receipt or document reference
  receiptUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Add pagination plugin
financialSchema.plugin(mongoosePaginate);

// Index for better performance
financialSchema.index({ type: 1, transactionDate: -1 });
financialSchema.index({ userId: 1, transactionDate: -1 });
financialSchema.index({ groupId: 1, transactionDate: -1 });
financialSchema.index({ createdBy: 1, transactionDate: -1 });

// Virtual for formatted amount
financialSchema.virtual('formattedAmount').get(function() {
  return `${this.amount.toLocaleString()} جنيه`;
});

// Virtual for user name (populated)
financialSchema.virtual('userName', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for group name (populated)
financialSchema.virtual('groupName', {
  ref: 'Group',
  localField: 'groupId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
financialSchema.set('toJSON', { virtuals: true });
financialSchema.set('toObject', { virtuals: true });

export default model('Financial', financialSchema);
