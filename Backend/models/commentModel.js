import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
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

commentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment;