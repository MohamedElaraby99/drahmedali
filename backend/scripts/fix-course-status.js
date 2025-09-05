import mongoose from 'mongoose';
import Course from '../models/course.model.js';
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

const fixCourseStatus = async () => {
  try {
    await connectToDb();
    
    // Update all courses to be published and active
    const result = await Course.updateMany(
      {},
      { 
        $set: { 
          isPublished: true, 
          isActive: true 
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} courses to be published and active`);
    
    // Verify the changes
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const activeCourses = await Course.countDocuments({ isActive: true });
    
    console.log(`Total courses: ${totalCourses}`);
    console.log(`Published courses: ${publishedCourses}`);
    console.log(`Active courses: ${activeCourses}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing course status:', error);
    process.exit(1);
  }
};

fixCourseStatus();
