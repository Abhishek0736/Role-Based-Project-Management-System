import express from 'express';
import { registerUser, loginUser, refreshToken } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/refresh', refreshToken);

export default authRouter;