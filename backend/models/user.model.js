import { Schema, model } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoosePaginate from 'mongoose-paginate-v2';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'Name is required'],
        minLength: [3, 'Name must be at least 3 character'],
        maxLength: [50, 'Name should be less than 50 character'],
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: function() {
            return ['ADMIN', 'SUPER_ADMIN'].includes(this.role);
        },
        lowercase: true,
        trim: true,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    phoneNumber: {
        type: String,
        required: function() {
            return this.role === 'USER';
        },
        unique: function() {
            return this.role === 'USER';
        },
        sparse: true,
        trim: true
    },
    fatherPhoneNumber: {
        type: String,
        required: false,
        trim: true
    },
    governorate: {
        type: String,
        required: function() {
            return !['ADMIN', 'SUPER_ADMIN'].includes(this.role);
        },
        trim: true
    },

    stage: {
        type: Schema.Types.ObjectId,
        ref: 'Stage',
        required: function() {
            return !['ADMIN', 'SUPER_ADMIN'].includes(this.role);
        }
    },
    age: {
        type: Number,
        required: function() {
            return !['ADMIN', 'SUPER_ADMIN'].includes(this.role);
        },
        min: [5, 'Age must be at least 5'],
        max: [100, 'Age cannot exceed 100']
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    role: {
        type: String,
        default: 'USER',
        enum: ['USER', 'ADMIN', 'SUPER_ADMIN']
    },
    adminPermissions: {
        type: [String],
        default: [],
        enum: ['CREATE_ADMIN', 'DELETE_ADMIN', 'MANAGE_USERS', 'MANAGE_COURSES', 'MANAGE_PAYMENTS', 'VIEW_ANALYTICS']
    },
    code: {
        type: String,
        trim: true,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    subscription: {
        id: String,
        status: String
    },
    // Track purchased courses and lessons
    hasPurchasedCourse: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    purchasedContentIds: [{
        type: Schema.Types.ObjectId,
        required: true
    }],
    wallet: {
        balance: {
            type: Number,
            default: 0
        },
        transactions: [{
            type: {
                type: String,
                enum: ['recharge', 'purchase', 'refund', 'access_code'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            code: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed'],
                default: 'completed'
            }
        }]
    }
},
    {
        timestamps: true
    });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    return next();
});

userSchema.methods = {
    generateJWTToken: function () {
        const payload = {
            id: this._id,
            role: this.role
        };
        
        // Include email for ADMIN/SUPER_ADMIN, phone number for USER
        if (this.role === 'USER') {
            payload.phoneNumber = this.phoneNumber;
            if (this.email) payload.email = this.email; // Include email if available
        } else {
            payload.email = this.email;
        }
        
        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        )
    },

    generatePasswordResetToken: async function () {
        const resetToken = await crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = await crypto
            .createHash('sha256')  
            .update(resetToken)
            .digest('hex');

        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min from now

        return resetToken;
    }

}

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

export default model("User", userSchema);