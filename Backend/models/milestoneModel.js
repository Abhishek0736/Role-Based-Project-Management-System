import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'overdue'],
        default: 'pending'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);

export default Milestone;