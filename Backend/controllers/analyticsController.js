import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';
import TimeTracking from '../models/timeTrackingModel.js';

// Get dashboard analytics
export const getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get user's projects and tasks
        const projects = await Project.find({
            $or: [
                { owner: userId },
                { 'team.user': userId }
            ]
        });
        
        const tasks = await Task.find({
            $or: [
                { owner: userId },
                { assignedTo: userId }
            ]
        });
        
        const timeEntries = await TimeTracking.find({ user: userId });
        
        // Calculate analytics
        const analytics = {
            projects: {
                total: projects.length,
                active: projects.filter(p => p.status === 'active').length,
                completed: projects.filter(p => p.status === 'completed').length,
                onHold: projects.filter(p => p.status === 'on-hold').length,
                avgProgress: projects.length > 0 ? 
                    Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0
            },
            tasks: {
                total: tasks.length,
                completed: tasks.filter(t => t.completed).length,
                inProgress: tasks.filter(t => t.status === 'in-progress').length,
                overdue: tasks.filter(t => 
                    t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
                ).length,
                highPriority: tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length
            },
            time: {
                totalHours: Math.round(timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60 * 10) / 10,
                billableHours: Math.round(timeEntries.filter(e => e.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60 * 10) / 10,
                totalEarnings: timeEntries.reduce((sum, entry) => {
                    return sum + (entry.billable ? (entry.duration / 60) * (entry.hourlyRate || 0) : 0);
                }, 0)
            },
            budget: {
                totalAllocated: projects.reduce((sum, p) => sum + (p.budget?.allocated || 0), 0),
                totalSpent: projects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0)
            }
        };
        
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get team analytics (admin only)
export const getTeamAnalytics = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        const allProjects = await Project.find({});
        const allTasks = await Task.find({});
        
        const teamAnalytics = {
            users: {
                total: users.length,
                active: users.filter(u => u.isActive).length,
                byRole: users.reduce((acc, user) => {
                    acc[user.role] = (acc[user.role] || 0) + 1;
                    return acc;
                }, {}),
                byDepartment: users.reduce((acc, user) => {
                    if (user.department) {
                        acc[user.department] = (acc[user.department] || 0) + 1;
                    }
                    return acc;
                }, {})
            },
            projects: {
                total: allProjects.length,
                byStatus: allProjects.reduce((acc, project) => {
                    acc[project.status] = (acc[project.status] || 0) + 1;
                    return acc;
                }, {}),
                totalBudget: allProjects.reduce((sum, p) => sum + (p.budget?.allocated || 0), 0),
                spentBudget: allProjects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0)
            },
            tasks: {
                total: allTasks.length,
                byStatus: allTasks.reduce((acc, task) => {
                    acc[task.status] = (acc[task.status] || 0) + 1;
                    return acc;
                }, {}),
                byPriority: allTasks.reduce((acc, task) => {
                    acc[task.priority] = (acc[task.priority] || 0) + 1;
                    return acc;
                }, {})
            }
        };
        
        res.json(teamAnalytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};