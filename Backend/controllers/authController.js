import User from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables are required');
}
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

const createTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
    const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
    return { accessToken, refreshToken };
};

// Register user
export async function registerUser(req, res) {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }
    
    try {
        if (await User.findOne({ email })) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword,
            role: role || 'employee'
        });
        
        const { accessToken, refreshToken } = createTokens(user._id);

        res.status(201).json({ 
            success: true, 
            accessToken,
            refreshToken,
            user: {
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Login user
export async function loginUser(req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and Password Required' });    
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        const { accessToken, refreshToken } = createTokens(user._id);
        
        res.status(200).json({ 
            success: true, 
            accessToken,
            refreshToken,
            user: {
                id: user._id, 
                name: user.name, 
                email: user.email,
                role: user.role
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Refresh token
export async function refreshToken(req, res) {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
    }
    
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = await User.findById(payload.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        
        const { accessToken, refreshToken: newRefreshToken } = createTokens(user._id);
        
        res.json({ 
            success: true, 
            accessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
}