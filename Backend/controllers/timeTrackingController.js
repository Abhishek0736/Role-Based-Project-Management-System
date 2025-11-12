import TimeTracking from '../models/timeTrackingModel.js';

// Get time entries for user
export const getTimeEntries = async (req, res) => {
    try {
        const entries = await TimeTracking.find({ user: req.user._id })
            .populate('project', 'name')
            .populate('task', 'title')
            .sort({ startTime: -1 });
        
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Start time tracking
export const startTimer = async (req, res) => {
    try {
        // Stop any active timers first
        await TimeTracking.updateMany(
            { user: req.user._id, isActive: true },
            { isActive: false, endTime: new Date() }
        );
        
        const timeEntry = new TimeTracking({
            ...req.body,
            user: req.user._id,
            startTime: new Date(),
            isActive: true
        });
        
        const savedEntry = await timeEntry.save();
        const populatedEntry = await TimeTracking.findById(savedEntry._id)
            .populate('project', 'name')
            .populate('task', 'title');
        
        res.status(201).json(populatedEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Stop time tracking
export const stopTimer = async (req, res) => {
    try {
        const timeEntry = await TimeTracking.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id, isActive: true },
            { 
                endTime: new Date(),
                isActive: false
            },
            { new: true }
        )
        .populate('project', 'name')
        .populate('task', 'title');
        
        if (!timeEntry) {
            return res.status(404).json({ message: 'Active time entry not found' });
        }
        
        res.json(timeEntry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update time entry
export const updateTimeEntry = async (req, res) => {
    try {
        const timeEntry = await TimeTracking.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        )
        .populate('project', 'name')
        .populate('task', 'title');
        
        if (!timeEntry) {
            return res.status(404).json({ message: 'Time entry not found' });
        }
        
        res.json(timeEntry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete time entry
export const deleteTimeEntry = async (req, res) => {
    try {
        const timeEntry = await TimeTracking.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!timeEntry) {
            return res.status(404).json({ message: 'Time entry not found' });
        }
        
        res.json({ message: 'Time entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get time tracking statistics
export const getTimeStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = { user: req.user._id };
        
        if (startDate && endDate) {
            filter.startTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const entries = await TimeTracking.find(filter);
        
        const stats = {
            totalEntries: entries.length,
            totalMinutes: entries.reduce((sum, entry) => sum + (entry.duration || 0), 0),
            billableMinutes: entries.filter(e => e.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0),
            totalEarnings: entries.reduce((sum, entry) => {
                return sum + (entry.billable ? (entry.duration / 60) * (entry.hourlyRate || 0) : 0);
            }, 0)
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};