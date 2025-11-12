import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { connectDB } from '../config/db.js';

const initializeUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Default users already exist.');
      return;
    }
    
    console.log('Creating default users...');

    // Default users with specified credentials
    const defaultUsers = [
      {
        name: 'System Admin',
        email: 'admin@pms.com',
        password: 'admin12345',
        role: 'admin',
        department: 'Administration',
        isActive: true
      },
      {
        name: 'Project Manager',
        email: 'manager@pms.com',
        password: 'manager123',
        role: 'manager',
        department: 'Management',
        isActive: true
      },
      {
        name: 'Employee Developer',
        email: 'employee@pms.com',
        password: 'employee123',
        role: 'employee',
        department: 'Development',
        isActive: true
      }
    ];

    // Hash passwords and create users
    for (const userData of defaultUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`Created user: ${userData.email} (${userData.role})`);
    }

    console.log('Default users initialized successfully!');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('👑 Admin: admin@pms.com / admin12345');
    console.log('👔 Manager: manager@pms.com / manager123');
    console.log('👨‍💻 Employee: employee@pms.com / employee123');
    
  } catch (error) {
    console.error('Error initializing users:', error);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeUsers().then(() => process.exit(0));
}

export default initializeUsers;