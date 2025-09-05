import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExamResult from '../models/examResult.model.js';
import Course from '../models/course.model.js';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI_ATLAS || process.env.MONGO_URI_COMPASS || process.env.MONGO_URI_COMMUNITY || 'mongodb://localhost:27017/almongezz_database';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkExamResults = async () => {
  try {
    console.log('🔍 Checking Exam Results Database...\n');

    // Check total exam results
    const totalResults = await ExamResult.countDocuments();
    console.log(`📊 Total Exam Results: ${totalResults}`);

    if (totalResults === 0) {
      console.log('⚠️  No exam results found in the database!');
      console.log('💡 This explains why the admin exam search shows no results.');
      console.log('💡 Exam results are only created when users actually complete exams.');
      return;
    }

    // Get sample exam results
    const sampleResults = await ExamResult.find().limit(5).populate('user', 'fullName email').populate('course', 'title');
    console.log('\n📋 Sample Exam Results:');
    sampleResults.forEach((result, index) => {
      console.log(`\n${index + 1}. Result ID: ${result._id}`);
      console.log(`   User: ${result.user?.fullName || result.user?.email || 'Unknown'}`);
      console.log(`   Course: ${result.course?.title || 'Unknown'}`);
      console.log(`   Lesson: ${result.lessonTitle}`);
      console.log(`   Exam Type: ${result.examType}`);
      console.log(`   Score: ${result.score}%`);
      console.log(`   Passed: ${result.passed ? 'Yes' : 'No'}`);
      console.log(`   Completed: ${result.completedAt}`);
    });

    // Check courses with exams
    const coursesWithExams = await Course.aggregate([
      {
        $lookup: {
          from: 'examresults',
          localField: '_id',
          foreignField: 'course',
          as: 'examResults'
        }
      },
      {
        $match: {
          $or: [
            { 'units.lessons.exams': { $exists: true, $ne: [] } },
            { 'directLessons.exams': { $exists: true, $ne: [] } }
          ]
        }
      },
      {
        $project: {
          title: 1,
          examResultsCount: { $size: '$examResults' },
          hasUnitExams: { $gt: [{ $size: { $ifNull: ['$units.lessons.exams', []] } }, 0] },
          hasDirectExams: { $gt: [{ $size: { $ifNull: ['$directLessons.exams', []] } }, 0] }
        }
      }
    ]);

    console.log('\n📚 Courses with Exams:');
    coursesWithExams.forEach(course => {
      console.log(`   • ${course.title}: ${course.examResultsCount} results, Unit Exams: ${course.hasUnitExams}, Direct Exams: ${course.hasDirectExams}`);
    });

    // Check users who have taken exams
    const usersWithExams = await User.aggregate([
      {
        $lookup: {
          from: 'examresults',
          localField: '_id',
          foreignField: 'user',
          as: 'examResults'
        }
      },
      {
        $match: {
          'examResults.0': { $exists: true }
        }
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          examResultsCount: { $size: '$examResults' }
        }
      },
      {
        $sort: { examResultsCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    console.log('\n👥 Top Users with Exam Results:');
    usersWithExams.forEach(user => {
      console.log(`   • ${user.fullName || user.email}: ${user.examResultsCount} results`);
    });

  } catch (error) {
    console.error('❌ Error checking exam results:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkExamResults();
  await mongoose.disconnect();
  console.log('\n✅ Disconnected from MongoDB');
};

main().catch(console.error);
