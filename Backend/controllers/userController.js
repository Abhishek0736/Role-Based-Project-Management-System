import User from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });


//Register a new user
export async function registerUser(req, res) {
    const { name, email, password, role, department } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (password.length < 6){
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
            role: role || 'developer',
            department: department || ''
        });
        const token = createToken(user._id);

        res.status(201).json({ success: true, token, user: {id: user._id, name: user.name, email: user.email, role: user.role} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Login user
export async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return  res.status(400).json({ success: false, message: 'Email and Password Required' });    
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
        
        const token = createToken(user._id);
        res.status(200).json({ 
            success: true, 
            token,
            accessToken: token, // For compatibility
            user: {
                id: user._id, 
                name: user.name, 
                email: user.email,
                role: user.role
            } 
        });
    } 
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Get user profile
export async function getUserProfile(req, res) {
    try {
        const user = await User.findById(req.user.id).select('name email role');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Update user profile
export async function updateUserProfile(req, res) {
    const { name, email } = req.body;
    if (!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Valid name and email are required' });
    }

    try {
        const exists = await User.findOne({ email, _id: { $ne: req.user.id } });

        if (exists) {
            return res.status(400).json({ success: false, message: 'Email already in use by another account' });
        }
        const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true, runValidators: true, select: 'name email' });
        res.json({ success: true, user });
    } 
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Change user password
export async function updatePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Passwords invalid or too short' });
    }

    try {
        const user = await User.findById(req.user.id).select('password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch){
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ success: true, message: 'Password updated successfully' });
    } 
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Get all users (for team management)
export async function getAllUsers(req, res) {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

// Update user role and details (Admin only)
export async function updateUser(req, res) {
    try {
        const { role, department, skills, hourlyRate, isActive } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role, department, skills, hourlyRate, isActive },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete user (Admin only)
export async function deleteUser(req, res) {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Create new user (Admin only)
export async function createUser(req, res) {
    try {
        const { name, email, password, role, department } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'employee',
            department: department || ''
        });
        
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get user statistics (Admin/Manager)
export async function getUserStats(req, res) {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        
        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            usersByRole
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}