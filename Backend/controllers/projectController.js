import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';

// Get all projects (role-based access)
export const getProjects = async (req, res) => {
    try {
        let query = {};
        
        // Admin can see all projects
        if (req.user.role === 'admin') {
            query = {};
        }
        // Manager can see projects they manage or are assigned to
        else if (req.user.role === 'manager') {
            query = {
                $or: [
                    { owner: req.user._id },
                    { 'team.user': req.user._id }
                ]
            };
        }
        // Employees can only see projects they're assigned to
        else {
            query = {
                'team.user': req.user._id
            };
        }

        const projects = await Project.find(query)
            .populate('owner', 'name email')
            .populate('team.user', 'name email role')
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single project
export const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('team.user', 'name email role department');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user has access to this project
        const isOwner = project.owner._id.toString() === req.user._id.toString();
        const isTeamMember = project.team.some(member => member.user && member.user._id.toString() === req.user._id.toString());
        const isAdmin = req.user.role === 'admin';

        const hasAccess = isOwner || isTeamMember || isAdmin;

        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create project
export const createProject = async (req, res) => {
    try {
        if (req.user.role === 'employee') {
            return res.status(403).json({ message: 'Only Admins or Project Managers can create projects.' });
        }

        const project = new Project({
            ...req.body,
            owner: req.user._id
        });

        const savedProject = await project.save();
        const populatedProject = await Project.findById(savedProject._id)
            .populate('owner', 'name email');

        res.status(201).json(populatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update project
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is owner or admin
        const isOwner = project.owner.toString() === req.user._id.toString();

        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('owner', 'name email')
         .populate('team.user', 'name email role');

        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete project
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add team member
export const addTeamMember = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isOwner = project.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Only the project owner or an admin can add team members' });
        }

        // Check if user is already in team
        const existingMember = project.team.find(member => member.user.toString() === userId);
        if (existingMember) {
            return res.status(400).json({ message: 'User is already a team member' });
        }

        project.team.push({ user: userId, role: role || 'developer' });
        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate('team.user', 'name email role department');

        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remove team member
export const removeTeamMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isOwner = project.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Only the project owner or an admin can remove team members' });
        }

        project.team = project.team.filter(member => member.user.toString() !== userId);
        await project.save();

        res.json({ message: 'Team member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get project statistics
export const getProjectStats = async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Get project tasks
        const tasks = await Task.find({ project: projectId });
        
        const stats = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(task => task.completed).length,
            inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
            overdueTasks: tasks.filter(task => 
                task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
            ).length,
            highPriorityTasks: tasks.filter(task => task.priority === 'High' || task.priority === 'Critical').length,
            totalEstimatedHours: tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
            totalActualHours: tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};