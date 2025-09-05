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

const checkCourses = async () => {
  try {
    await connectToDb();
    
    // Get all courses without any filtering
    const allCourses = await Course.find({});
    
    console.log(`Total courses in database: ${allCourses.length}`);
    
    allCourses.forEach((course, index) => {
      console.log(`\nCourse ${index + 1}:`);
      console.log(`  ID: ${course._id}`);
      console.log(`  Title: ${course.title}`);
      console.log(`  isActive: ${course.isActive}`);
      console.log(`  isPublished: ${course.isPublished}`);
      console.log(`  Instructor: ${course.instructor}`);
      console.log(`  Stage: ${course.stage}`);
    });
    
    // Check courses with isActive: true
    const activeCourses = await Course.find({ isActive: true });
    console.log(`\nCourses with isActive: true: ${activeCourses.length}`);
    
    // Check courses with isActive: false
    const inactiveCourses = await Course.find({ isActive: false });
    console.log(`Courses with isActive: false: ${inactiveCourses.length}`);
    
    // Check courses without isActive field
    const coursesWithoutIsActive = await Course.find({ isActive: { $exists: false } });
    console.log(`Courses without isActive field: ${coursesWithoutIsActive.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking courses:', error);
    process.exit(1);
  }
};

checkCourses();
