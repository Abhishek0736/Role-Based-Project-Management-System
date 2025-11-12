import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { 
    registerUser, 
    loginUser, 
    updatePassword, 
    updateUserProfile, 
    getUserProfile, 
    getAllUsers, 
    updateUser,
    deleteUser,
    createUser,
    getUserStats
} from '../controllers/userController.js';
import { adminOnly, managerOrAdmin, authenticated } from '../middleware/rbac.js';

const userRouter = express.Router();

//Public Routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

//Protected Routes - All authenticated users
userRouter.get('/me', authMiddleware, authenticated, getUserProfile);
userRouter.put('/profile', authMiddleware, authenticated, updateUserProfile);
userRouter.put('/password', authMiddleware, authenticated, updatePassword);

//Manager and Admin routes
userRouter.get('/all', authMiddleware, managerOrAdmin, getAllUsers);
userRouter.get('/stats', authMiddleware, managerOrAdmin, getUserStats);

//Admin only routes
userRouter.post('/create', authMiddleware, adminOnly, createUser);
userRouter.put('/:id', authMiddleware, adminOnly, updateUser);
userRouter.delete('/:id', authMiddleware, adminOnly, deleteUser);

export default userRouter;