import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";
import Comment from "../models/commentModel.js";

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed, project, status, estimatedHours, tags } = req.body;

    if (req.user.role === 'employee') {
      return res.status(403).json({ message: 'Only Admins or Project Managers can create tasks.' });
    }

    if (project) {
      const projectDoc = await Project.findById(project);
      if (!projectDoc) {
        return res.status(404).json({ message: 'Project not found' });
      }
      const isOwner = projectDoc.owner.toString() === req.user._id.toString();
      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You can only create tasks for projects you own.' });
      }
    }
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      completed: completed === "Yes" || completed === true,
      status: status || 'todo',
      project,
      estimatedHours: estimatedHours || 0,
      tags: tags || [],
      owner: req.user._id,
      assignedTo: req.body.assignedTo || [],
    });
    const savedTask = await task.save();
    const populatedTask = await Task.findById(savedTask._id)
      .populate('project', 'name')
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email');
    

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
 
// Get all Task for Logged in User (role-based access)
export const getTasks = async (req, res) => {
  try {
    let query = {};
    
    // Admin can see all tasks
    if (req.user.role === 'admin') {
      query = {};
    }
    // Manager can see tasks in their projects
    else if (req.user.role === 'manager') {
      const managerProjects = await Project.find({
        $or: [
          { owner: req.user._id },
          { 'team.user': req.user._id },
          { members: req.user._id }
        ]
      }).select('_id');
      
      const projectIds = managerProjects.map(p => p._id);
      
      query = {
        $or: [
          { owner: req.user._id },
          { assignedTo: req.user._id },
          { project: { $in: projectIds } }
        ]
      };
    }
    // Employees can see tasks assigned to them or in their projects
    else {
      const employeeProjects = await Project.find({
        $or: [
          { 'team.user': req.user._id },
          { members: req.user._id }
        ]
      }).select('_id');
      
      const projectIds = employeeProjects.map(p => p._id);
      
      query = {
        $or: [
          { owner: req.user._id },
          { assignedTo: req.user._id },
          { project: { $in: projectIds } }
        ]
      };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//Get single Task for Logged in User (role-based access)
export const getTaskById = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Admin can see any task
    if (req.user.role === 'admin') {
      // No additional query restrictions
    }
    // Manager can see tasks in their projects
    else if (req.user.role === 'manager') {
      const managerProjects = await Project.find({
        $or: [
          { owner: req.user._id },
          { 'team.user': req.user._id }
        ]
      }).select('_id');
      
      const projectIds = managerProjects.map(p => p._id);
      
      query = {
        _id: req.params.id,
        $or: [
          { owner: req.user._id },
          { assignedTo: req.user._id },
          { project: { $in: projectIds } }
        ]
      };
    }
    // Employees can only see their own tasks
    else {
      query = {
        _id: req.params.id,
        $or: [
          { owner: req.user._id },
          { assignedTo: req.user._id }
        ]
      };
    }

    const task = await Task.findOne(query)
      .populate('project', 'name')
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update a Task (role-based restrictions)
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check access permissions
    let canUpdate = false;
    
    if (req.user.role === 'admin') {
      canUpdate = true;
    } else if (req.user.role === 'manager') {
      // Manager can update tasks in their projects or tasks they own
      const isOwner = task.owner.toString() === req.user._id.toString();
      const isProjectManager = task.project && task.project.owner.toString() === req.user._id.toString();
      canUpdate = isOwner || isProjectManager;
    } else if (req.user.role === 'employee') {
      // Employee can only update assigned tasks (limited fields)
      const isAssigned = task.assignedTo.includes(req.user._id) || task.owner.toString() === req.user._id.toString();
      canUpdate = isAssigned;
      
      // Restrict what employees can update
      if (canUpdate) {
        const allowedFields = ['status', 'completed', 'description'];
        const updateFields = Object.keys(req.body);
        const hasRestrictedFields = updateFields.some(field => !allowedFields.includes(field));
        
        if (hasRestrictedFields) {
          return res.status(403).json({ message: "Employees can only update status, completion, and description" });
        }
      }
    }

    if (!canUpdate) {
      return res.status(403).json({ message: "Access denied" });
    }

    const data = {...req.body };
    if (data.completed !== undefined) {
      data.completed = data.completed === "Yes" || data.completed === true;
    }

    const UpdatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    )
    .populate('project', 'name')
    .populate('owner', 'name email')
    .populate('assignedTo', 'name email');
    
    res.json(UpdatedTask);
  } 
  catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete a Task (Owner/Admin/Manager only)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check permissions - owner, admin, or manager can delete
    const canDelete = req.user.role === 'admin' || 
                     req.user.role === 'manager' || 
                     task.owner.toString() === req.user._id.toString();
    
    if (!canDelete) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } 
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add comment to task
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.comments.push({
      user: req.user._id,
      content
    });
    
    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name email');
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get task comments
export const getTaskComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add standalone comment
export const addTaskComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const comment = new Comment({
      author: req.user._id,
      text,
      task: req.params.id
    });
    
    await comment.save();
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update task status (for employees)
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    

    
    // Check if user has permission to update task status
    const isOwner = task.owner.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.some(assignee => 
      (assignee._id || assignee).toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';
    
    // For employees, check if they can see this task (using same logic as getTasks)
    let canUpdate = isAdmin || isManager || isOwner || isAssigned;
    
    if (req.user.role === 'employee' && !canUpdate) {
      // Check if employee has access to this task through project membership
      const employeeProjects = await Project.find({
        $or: [
          { 'team.user': req.user._id },
          { members: req.user._id }
        ]
      }).select('_id');
      
      const projectIds = employeeProjects.map(p => p._id.toString());
      const taskProjectId = task.project ? task.project.toString() : null;
      
      canUpdate = taskProjectId && projectIds.includes(taskProjectId);
    }
    

    
    if (!canUpdate) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you or in your projects' });
    }
    
    task.status = status;
    if (status === 'done') {
      task.completed = true;
    } else {
      task.completed = false;
    }
    
    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email');
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add subtask
export const addSubtask = async (req, res) => {
  try {
    const { title } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.subtasks.push({
      title,
      assignedTo: req.user._id
    });
    
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
