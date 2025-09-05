import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';

dotenv.config();

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/almongezz');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

const testSuperAdmin = async () => {
  try {
    await connectToDb();
    
    // Check if super admin exists
    const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (superAdmin) {
      console.log('✅ Super admin found:');
      console.log('👤 Username:', superAdmin.username);
      console.log('📧 Email:', superAdmin.email);
      console.log('👑 Role:', superAdmin.role);
      console.log('🔑 Permissions:', superAdmin.adminPermissions);
    } else {
      console.log('❌ No super admin found');
    }
    
    // Check if regular admin exists
    const regularAdmin = await User.findOne({ role: 'ADMIN' });
    if (regularAdmin) {
      console.log('\n✅ Regular admin found:');
      console.log('👤 Username:', regularAdmin.username);
      console.log('📧 Email:', regularAdmin.email);
      console.log('👑 Role:', regularAdmin.role);
    } else {
      console.log('\n❌ No regular admin found');
    }
    
    // Count users by role
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 User counts by role:');
    userCounts.forEach(role => {
      console.log(`${role._id}: ${role.count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing super admin:', error);
    process.exit(1);
  }
};

testSuperAdmin();
