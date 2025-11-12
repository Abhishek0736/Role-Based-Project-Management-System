import express from 'express';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addTeamMember,
    removeTeamMember,
    getProjectStats
} from '../controllers/projectController.js';
import authMiddleware from '../middleware/auth.js';
import { 
    adminOnly, 
    managerOrAdmin, 
    allRoles, 
    checkProjectOwnership 
} from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Project routes with role-based access
router.get('/', allRoles, getProjects); // All can view projects (filtered by role)
router.get('/:id', allRoles, getProject); // All can view specific project (filtered by role)
router.post('/', managerOrAdmin, createProject); // Only managers and admins can create
router.put('/:id', managerOrAdmin, checkProjectOwnership, updateProject); // Only project owner or admin
router.delete('/:id', managerOrAdmin, checkProjectOwnership, deleteProject); // Only project owner or admin

// Team management routes - only managers and admins
router.post('/:id/team', managerOrAdmin, checkProjectOwnership, addTeamMember);
router.delete('/:id/team/:userId', managerOrAdmin, checkProjectOwnership, removeTeamMember);

// Statistics route - all authenticated users can view stats
router.get('/:id/stats', allRoles, getProjectStats);

export default router;