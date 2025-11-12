// Role-Based Access Control Middleware
const roleHierarchy = {
  admin: 3,
  manager: 2,
  employee: 1
};

// Enhanced role checking function
export const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRole = req.user.role;
    const hasPermission = allowedRoles.includes(userRole);

    if (!hasPermission) {
      return res.status(403).json({ 
        message: "Access denied",
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

// Check if user has required role or higher (hierarchical)
export const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRole = req.user.role;
    const hasPermission = requiredRoles.some(role => 
      roleHierarchy[userRole] >= roleHierarchy[role]
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        message: "Access denied",
        required: requiredRoles,
        current: userRole
      });
    }

    next();
  };
};

// Specific role access controls
export const adminOnly = roleCheck('admin');
export const managerOnly = roleCheck('manager');
export const employeeOnly = roleCheck('employee');
export const managerOrAdmin = roleCheck('admin', 'manager');
export const allRoles = roleCheck('admin', 'manager', 'employee');

// All authenticated users
export const authenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Project ownership check for managers
export const checkProjectOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(); // Admin can access all projects
    }
    
    if (req.user.role === 'manager') {
      const Project = (await import('../models/projectModel.js')).default;
      const project = await Project.findById(req.params.id || req.body.project);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (project.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied: Not your project' });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Task access check for employees
export const checkTaskAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(); // Admin can access all tasks
    }
    
    const Task = (await import('../models/taskModel.js')).default;
    const task = await Task.findById(req.params.id).populate('project');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (req.user.role === 'manager') {
      // Manager can access tasks in their projects
      if (task.project && task.project.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied: Not your project task' });
      }
    } else if (req.user.role === 'employee') {
      // Employee can only access assigned tasks
      if (!task.assignedTo.includes(req.user._id)) {
        return res.status(403).json({ message: 'Access denied: Task not assigned to you' });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};