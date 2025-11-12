import User from '../models/userModel.js';
import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import TimeTracking from '../models/timeTrackingModel.js';

// Admin Dashboard - Full system overview
export const getAdminDashboard = async (req, res) => {
    try {
        const [
            totalUsers,
            totalProjects,
            totalTasks,
            activeUsers,
            usersByRole,
            recentProjects,
            tasksByStatus,
            recentActivities
        ] = await Promise.all([
            User.countDocuments(),
            Project.countDocuments(),
            Task.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
            Project.find().sort({ createdAt: -1 }).limit(5).populate('manager', 'name email'),
            Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Task.find().sort({ updatedAt: -1 }).limit(10).populate('assignedTo', 'name').populate('project', 'name')
        ]);

        res.json({
            stats: {
                totalUsers,
                totalProjects,
                totalTasks,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers
            },
            usersByRole,
            tasksByStatus,
            recentProjects,
            recentActivities
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Manager Dashboard - Project-level overview
export const getManagerDashboard = async (req, res) => {
    try {
        const managerId = req.user._id;
        
        const [
            myProjects,
            myTasks,
            teamMembers,
            projectStats,
            tasksByStatus,
            recentActivities
        ] = await Promise.all([
            Project.find({ manager: managerId }).populate('team', 'name email role'),
            Task.find({ project: { $in: await Project.find({ manager: managerId }).select('_id') } })
                .populate('assignedTo', 'name')
                .populate('project', 'name'),
            User.find({ 
                _id: { 
                    $in: await Project.find({ manager: managerId })
                        .distinct('team')
                        .then(teams => teams.flat())
                }
            }).select('name email role department'),
            Project.aggregate([
                { $match: { manager: managerId } },
                { $group: { 
                    _id: '$status', 
                    count: { $sum: 1 },
                    projects: { $push: { name: '$name', _id: '$_id' } }
                }}
            ]),
            Task.aggregate([
                { $lookup: { from: 'projects', localField: 'project', foreignField: '_id', as: 'projectInfo' } },
                { $match: { 'projectInfo.manager': managerId } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Task.find({ project: { $in: await Project.find({ manager: managerId }).select('_id') } })
                .sort({ updatedAt: -1 })
                .limit(10)
                .populate('assignedTo', 'name')
                .populate('project', 'name')
        ]);

        res.json({
            stats: {
                totalProjects: myProjects.length,
                totalTasks: myTasks.length,
                teamSize: teamMembers.length,
                completedTasks: myTasks.filter(task => task.status === 'done').length
            },
            myProjects,
            tasksByStatus,
            projectStats,
            teamMembers,
            recentActivities
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Employee Dashboard - Personal task overview
export const getEmployeeDashboard = async (req, res) => {
    try {
        const employeeId = req.user._id;
        
        const [
            myTasks,
            myProjects,
            tasksByStatus,
            recentActivities,
            timeEntries,
            upcomingDeadlines
        ] = await Promise.all([
            Task.find({ assignedTo: employeeId })
                .populate('project', 'name')
                .populate('assignedTo', 'name'),
            Project.find({ team: employeeId })
                .populate('manager', 'name email')
                .select('name description status manager'),
            Task.aggregate([
                { $match: { assignedTo: employeeId } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Task.find({ assignedTo: employeeId })
                .sort({ updatedAt: -1 })
                .limit(10)
                .populate('project', 'name'),
            TimeTracking.find({ user: employeeId })
                .sort({ date: -1 })
                .limit(7)
                .populate('task', 'title')
                .populate('project', 'name'),
            Task.find({ 
                assignedTo: employeeId,
                dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                status: { $ne: 'done' }
            }).populate('project', 'name').sort({ dueDate: 1 })
        ]);

        const totalHoursThisWeek = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

        res.json({
            stats: {
                totalTasks: myTasks.length,
                completedTasks: myTasks.filter(task => task.status === 'done').length,
                pendingTasks: myTasks.filter(task => task.status !== 'done').length,
                totalProjects: myProjects.length,
                hoursThisWeek: totalHoursThisWeek
            },
            myTasks,
            myProjects,
            tasksByStatus,
            recentActivities,
            upcomingDeadlines,
            timeEntries
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};