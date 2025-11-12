import express from 'express';
import {
    getMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone
} from '../controllers/milestoneController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Milestone routes
router.get('/project/:projectId', getMilestones);
router.post('/', createMilestone);
router.put('/:id', updateMilestone);
router.delete('/:id', deleteMilestone);

export default router;