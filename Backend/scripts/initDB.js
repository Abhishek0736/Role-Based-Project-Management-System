import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import 'dotenv/config';

const initializeDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pms');
        console.log('Connected to MongoDB');

        // Create admin user if not exists
        let adminExists = await User.findOne({ email: 'admin@pms.com' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin12345', 10);
            const admin = new User({
                name: 'System Administrator',
                email: 'admin@pms.com',
                password: hashedPassword,
                role: 'admin',
                department: 'IT',
                skills: ['Management', 'System Administration'],
                hourlyRate: 100,
                isActive: true
            });
            await admin.save();
            console.log('Admin user created: admin@pms.com / admin12345');
        }

        // Create sample users
        const sampleUsers = [
            {
                name: 'Employee User',
                email: 'employee@pms.com',
                password: await bcrypt.hash('employee123', 10),
                role: 'developer',
                department: 'Engineering',
                skills: ['JavaScript', 'React', 'Node.js'],
                hourlyRate: 75
            },
            {
                name: 'Manager User',
                email: 'manager@pms.com',
                password: await bcrypt.hash('manager123', 10),
                role: 'manager',
                department: 'Management',
                skills: ['Project Management', 'Leadership', 'Agile'],
                hourlyRate: 90
            }
        ];
        for (const userData of sampleUsers) {
            const userExists = await User.findOne({ email: userData.email });
            if (!userExists) {
                const user = new User(userData);
                await user.save();
                console.log(`Sample user created: ${userData.email}`);
            }
        }

        console.log('Database initialization completed!');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
};

initializeDatabase();