import { model, Schema } from "mongoose";

const userDeviceSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceFingerprint: {
        type: String,
        required: true
    },
    deviceInfo: {
        userAgent: { type: String, required: true },
        platform: { type: String },
        browser: { type: String },
        os: { type: String },
        ip: { type: String },
        screenResolution: { type: String },
        timezone: { type: String }
    },
    deviceName: {
        type: String,
        default: "Unknown Device"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    firstLogin: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    loginCount: {
        type: Number,
        default: 1
    },
    deactivatedAt: {
        type: Date,
        default: null
    },
    deactivationReason: {
        type: String,
        default: null
    }
}, { 
    timestamps: true 
});

// Compound index to ensure unique device per user
userDeviceSchema.index({ user: 1, deviceFingerprint: 1 }, { unique: true });

// Index for user lookups
userDeviceSchema.index({ user: 1 });

// Index for device fingerprint lookups
userDeviceSchema.index({ deviceFingerprint: 1 });

const UserDevice = model("UserDevice", userDeviceSchema);

export default UserDevice;
