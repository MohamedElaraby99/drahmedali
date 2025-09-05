import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const connectToDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/almongezz', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const fixAdminCredentials = async () => {
  try {
    await connectToDb();
    
    // Find the existing admin user
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    
    if (!existingAdmin) {
      console.log('No admin user found. Creating new one...');
      
      const newAdmin = new User({
        username: 'adminn',
        fullName: 'System Administrator',
        email: 'adminn@api.com',
        password: '1234567',
        role: 'ADMIN',
        isActive: true
      });
      
      await newAdmin.save();
      console.log('✅ New admin user created successfully!');
    } else {
      console.log('Updating existing admin user...');
      
      // Update the email to match what the user is trying to login with
      existingAdmin.email = 'adminn@api.com';
      existingAdmin.password = '1234567'; // This will be hashed by the pre-save middleware
      
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully!');
    }
    
    console.log('\n📧 Email: adminn@api.com');
    console.log('👤 Username: adminn');
    console.log('🔐 Password: 1234567');
    console.log('👑 Role: ADMIN');
    console.log('\n💡 You can now login with these credentials');
    console.log('🌐 Go to: http://localhost:5173/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin credentials:', error);
    process.exit(1);
  }
};

fixAdminCredentials();
