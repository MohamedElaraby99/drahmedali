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

const createAdminUser = async () => {
  try {
    await connectToDb();
    
    // Check if admin already exists
    // const existingAdmin = await User.findOne({ role: 'ADMIN' });
    // if (existingAdmin) {
    //   console.log('Admin user already exists:', existingAdmin.email);
    //   process.exit(0);
    // }
    
    // Create admin user - don't hash password manually, let the model handle it
    const adminUser1 = {
      username: 'adminn',
      fullName: 'System Administrator',
      email: 'adminn@api.com',
      password: '1234567', // Will be hashed by the pre-save middleware
      role: 'ADMIN',
      isActive: true
    };

    const adminUser = new User(adminUser1);

    const existingAdmin = await User.findOne({ username: adminUser1.username }).exec();
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email , existingAdmin.username);
      return;
    }
    
    await adminUser.save();

    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: adminn@api.com');
    console.log('👤 Username: adminn');
    console.log('🔐 Password: 123456');
    console.log('👑 Role: ADMIN');
    console.log('\n💡 You can now login with these credentials');
    console.log('🌐 Go to: http://localhost:5173/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
