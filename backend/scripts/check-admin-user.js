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

const checkAdminUser = async () => {
  try {
    await connectToDb();
    
    // Find all admin users
    const adminUsers = await User.find({ role: 'ADMIN' }).select('+password');
    
    if (adminUsers.length === 0) {
      console.log('No admin users found');
      return;
    }
    
    console.log(`Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach((admin, index) => {
      console.log(`\n--- Admin ${index + 1} ---`);
      console.log(`ID: ${admin._id}`);
      console.log(`Username: ${admin.username}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Full Name: ${admin.fullName}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Is Active: ${admin.isActive}`);
      console.log(`Password (hashed): ${admin.password}`);
      console.log(`Created: ${admin.createdAt}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking admin users:', error);
    process.exit(1);
  }
};

checkAdminUser();
