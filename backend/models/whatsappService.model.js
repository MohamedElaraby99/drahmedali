import { Schema, model } from "mongoose";

const whatsappServiceSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Service description is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Service category is required'],
        enum: ['course', 'tutoring', 'consultation', 'support', 'payment', 'other'],
        default: 'other'
    },
    whatsappNumbers: [{
        number: {
            type: String,
            required: [true, 'WhatsApp number is required'],
            trim: true
        },
        name: {
            type: String,
            required: [true, 'Contact name is required'],
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        workingHours: {
            type: String,
            default: '24/7'
        }
    }],
    currency: {
        type: String,
        default: 'EGP'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    icon: {
        type: String,
        default: '📞'
    },
    instructions: {
        type: String,
        default: 'Contact us on WhatsApp for this service'
    },
    estimatedResponseTime: {
        type: String,
        default: 'Within 24 hours'
    }
}, {
    timestamps: true
});

// Index for better query performance
whatsappServiceSchema.index({ category: 1, isActive: 1 });
whatsappServiceSchema.index({ name: 1 });

const WhatsAppService = model("WhatsAppService", whatsappServiceSchema);

export default WhatsAppService; 