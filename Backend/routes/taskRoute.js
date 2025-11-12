import express from "express";
import authMiddleware from "../middleware/auth.js";
import { 
    adminOnly, 
    managerOrAdmin, 
    allRoles, 
    checkTaskAccess 
} from '../middleware/rbac.js';
import { 
    createTask, 
    getTasks, 
    deleteTask, 
    getTaskById, 
    updateTask, 
    addComment, 
    addSubtask,
    getTaskComments,
    addTaskComment,
    updateTaskStatus
} from "../controllers/taskController.js";

const taskRouter = express.Router();

// All routes require authentication
taskRouter.use(authMiddleware);

// Task CRUD routes with role-based access
taskRouter
  .route("/gp")
  .get(allRoles, getTasks) // All can view tasks (filtered by role)
  .post(managerOrAdmin, createTask); // Only managers and admins can create

taskRouter
  .route("/:id")
  .get(allRoles, getTaskById) // All can view specific task (with access check)
  .put(allRoles, updateTask) // All can update (with role-specific restrictions)
  .delete(managerOrAdmin, checkTaskAccess, deleteTask); // Only managers/admins can delete

// Legacy routes for compatibility
taskRouter
  .route("/:id/gp")
  .get(allRoles, getTaskById)
  .put(allRoles, updateTask)
  .delete(managerOrAdmin, checkTaskAccess, deleteTask);

// Additional task routes
taskRouter.post('/:id/comments', allRoles, addComment); // All can comment
taskRouter.get('/:id/comments', allRoles, getTaskComments); // Get task comments
taskRouter.post('/:id/comments/add', allRoles, addTaskComment); // Add standalone comment
taskRouter.put('/:id/status', allRoles, updateTaskStatus); // Update task status
taskRouter.post('/:id/subtasks', managerOrAdmin, addSubtask); // Only managers can add subtasks

export default taskRouter;
