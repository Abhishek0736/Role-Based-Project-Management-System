import mongoose from 'mongoose';

const timeTrackingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    isActive: {
        type: Boolean,
        default: false
    },
    billable: {
        type: Boolean,
        default: true
    },
    hourlyRate: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate duration before saving
timeTrackingSchema.pre('save', function(next) {
    if (this.startTime && this.endTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert to minutes
        this.isActive = false;
    }
    next();
});

const TimeTracking = mongoose.models.TimeTracking || mongoose.model('TimeTracking', timeTrackingSchema);

export default TimeTracking;