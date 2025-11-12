import express from 'express';
import {
    getDashboardAnalytics,
    getTeamAnalytics
} from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Analytics routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/team', getTeamAnalytics);

export default router;