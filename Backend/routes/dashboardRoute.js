import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { adminOnly, managerOnly, employeeOnly } from '../middleware/rbac.js';
import {
    getAdminDashboard,
    getManagerDashboard,
    getEmployeeDashboard
} from '../controllers/dashboardController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Role-specific dashboard routes
router.get('/admin', adminOnly, getAdminDashboard);
router.get('/manager', managerOnly, getManagerDashboard);
router.get('/employee', employeeOnly, getEmployeeDashboard);

export default router;