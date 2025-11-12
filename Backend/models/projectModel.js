import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
        default: 'planning'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    budget: {
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 }
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    team: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['manager', 'developer', 'designer', 'tester', 'analyst'],
            default: 'developer'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [String],
    attachments: [{
        filename: String,
        originalName: String,
        size: Number,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

projectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;