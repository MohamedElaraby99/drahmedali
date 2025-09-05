import mongoose from 'mongoose';
import Course from './models/course.model.js';

// Set default environment variables
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/almongezz

const testDatabase = async () => {
  try {
    console.log('Testing database connection...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Test course stats
    console.log('\nTesting course statistics...');
    
    const totalCourses = await Course.countDocuments({ isActive: true });
    console.log('Total courses:', totalCourses);
    
    const publishedCourses = await Course.countDocuments({ isActive: true, isPublished: true });
    console.log('Published courses:', publishedCourses);
    
    const featuredCourses = await Course.countDocuments({ isActive: true, featured: true });
    console.log('Featured courses:', featuredCourses);
    
    // Test aggregation queries
    try {
      const totalStudents = await Course.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$totalStudents' } } }
      ]);
      console.log('Total students:', totalStudents[0]?.total || 0);
    } catch (error) {
      console.error('Error calculating total students:', error.message);
    }
    
    try {
      const totalRevenue = await Course.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$totalStudents'] } } } }
      ]);
      console.log('Total revenue:', totalRevenue[0]?.total || 0);
    } catch (error) {
      console.error('Error calculating total revenue:', error.message);
    }
    
    try {
      const coursesByLevel = await Course.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]);
      console.log('Courses by level:', coursesByLevel);
    } catch (error) {
      console.error('Error calculating courses by level:', error.message);
    }
    
    try {
      const coursesByLanguage = await Course.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$language', count: { $sum: 1 } } }
      ]);
      console.log('Courses by language:', coursesByLanguage);
    } catch (error) {
      console.error('Error calculating courses by language:', error.message);
    }
    
    // List all courses
    console.log('\nAll courses in database:');
    const allCourses = await Course.find({}).select('title isActive isPublished featured totalStudents price level language');
    allCourses.forEach(course => {
      console.log(`- ${course.title} (Active: ${course.isActive}, Published: ${course.isPublished}, Featured: ${course.featured}, Students: ${course.totalStudents}, Price: ${course.price}, Level: ${course.level}, Language: ${course.language})`);
    });
    
    console.log('\n✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

testDatabase();
