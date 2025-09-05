import { Schema, model } from "mongoose";

const rechargeCodeSchema = new Schema({
    code: {
        type: String,
        required: [true, 'Code is required'],
        unique: true,
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be at least 1 EGP']
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    usedAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        default: function() {
            // Codes expire after 1 year
            return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        }
    }
}, {
    timestamps: true
});

// Generate a unique code
rechargeCodeSchema.statics.generateCode = function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Check if code is valid and unused
rechargeCodeSchema.statics.validateCode = function(code) {
    return this.findOne({
        code: code,
        isUsed: false,
        expiresAt: { $gt: new Date() }
    });
};

export default model("RechargeCode", rechargeCodeSchema); 