import Milestone from '../models/milestoneModel.js';
import Project from '../models/projectModel.js';

// Get all milestones for a project
export const getMilestones = async (req, res) => {
    try {
        const { projectId } = req.params;
        const milestones = await Milestone.find({ project: projectId })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ dueDate: 1 });
        
        res.json(milestones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create milestone
export const createMilestone = async (req, res) => {
    try {
        const milestone = new Milestone({
            ...req.body,
            createdBy: req.user._id
        });
        
        const savedMilestone = await milestone.save();
        const populatedMilestone = await Milestone.findById(savedMilestone._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');
        
        res.status(201).json(populatedMilestone);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update milestone
export const updateMilestone = async (req, res) => {
    try {
        const milestone = await Milestone.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
        
        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }
        
        res.json(milestone);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete milestone
export const deleteMilestone = async (req, res) => {
    try {
        const milestone = await Milestone.findByIdAndDelete(req.params.id);
        
        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }
        
        res.json({ message: 'Milestone deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};