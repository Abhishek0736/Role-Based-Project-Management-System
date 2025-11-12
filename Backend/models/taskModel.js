import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const taskSchema = new mongoose.Schema({
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
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'done'],
        default: 'todo'
    },
    dueDate: {
        type: Date,
        default: null
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    milestone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    completed: {
        type: Boolean,
        default: false
    },
    estimatedHours: {
        type: Number,
        default: 0
    },
    actualHours: {
        type: Number,
        default: 0
    },
    subtasks: [subtaskSchema],
    comments: [commentSchema],
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
    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;