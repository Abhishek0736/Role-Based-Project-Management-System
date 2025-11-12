import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'employee'],
        default: 'employee'
    },
    department: {
        type: String,
        trim: true,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    skills: [String],
    hourlyRate: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            taskUpdates: { type: Boolean, default: true },
            projectUpdates: { type: Boolean, default: true }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const userModel = mongoose.models.User || mongoose.model('User', userSchema);

export default userModel;