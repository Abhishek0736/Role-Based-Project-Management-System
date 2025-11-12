import bcrypt from 'bcryptjs';
import User from './models/userModel.js';
import { connectDB } from './config/db.js';

const initDB = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    console.log('🔄 Checking existing users...');
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log('✅ Default users already exist.');
      console.log('\n=== LOGIN CREDENTIALS ===');
      console.log('👑 Admin: admin@pms.com / admin12345');
      console.log('👔 Manager: manager@pms.com / manager123');
      console.log('👨💻 Employee: employee@pms.com / employee123');
      console.log('========================\n');
      return;
    }
    
    console.log('🔄 Creating default users...');

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

    for (const userData of defaultUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Default users created successfully!');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('👑 Admin: admin@pms.com / admin12345');
    console.log('👔 Manager: manager@pms.com / manager123');
    console.log('👨💻 Employee: employee@pms.com / employee123');
    console.log('========================\n');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    process.exit(0);
  }
};

initDB();