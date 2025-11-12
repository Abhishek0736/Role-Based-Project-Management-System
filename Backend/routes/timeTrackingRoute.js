import express from 'express';
import {
    getTimeEntries,
    startTimer,
    stopTimer,
    updateTimeEntry,
    deleteTimeEntry,
    getTimeStats
} from '../controllers/timeTrackingController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Time tracking routes
router.get('/', getTimeEntries);
router.get('/stats', getTimeStats);
router.post('/start', startTimer);
router.put('/:id/stop', stopTimer);
router.put('/:id', updateTimeEntry);
router.delete('/:id', deleteTimeEntry);

export default router;