import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/course.model.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI_ATLAS || process.env.MONGO_URI_COMPASS || process.env.MONGO_URI_COMMUNITY || 'mongodb://localhost:27017/almongezz_database';
    console.log('🔗 Connecting to MongoDB...');
    console.log('🔗 URI:', uri);
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    
    // Check which database we're connected to
    const dbName = mongoose.connection.db.databaseName;
    console.log(`🗄️  Connected to database: ${dbName}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Collections in database: ${collections.map(c => c.name).join(', ')}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugExamResults = async () => {
  try {
    console.log('🔍 Debugging Exam Results...\n');

    // Check total courses
    const totalCourses = await Course.countDocuments();
    console.log(`📚 Total courses in database: ${totalCourses}`);

    // Find courses with exams
    const coursesWithExams = await Course.find({
      $or: [
        { 'units.lessons.exams': { $exists: true, $ne: [] } },
        { 'directLessons.exams': { $exists: true, $ne: [] } }
      ]
    }).select('title units directLessons').lean();

    console.log(`📚 Found ${coursesWithExams.length} courses with exams\n`);

    if (coursesWithExams.length === 0) {
      console.log('❌ No courses with exams found. Let me check what courses exist...\n');
      
      // Get all courses to see what's there
      const allCourses = await Course.find({}).select('title units directLessons').limit(5).lean();
      console.log('📚 Sample courses:');
      for (const course of allCourses) {
        console.log(`  - ${course.title}`);
        console.log(`    - Has units: ${!!course.units}`);
        console.log(`    - Has directLessons: ${!!course.directLessons}`);
        if (course.units) {
          console.log(`    - Units count: ${course.units.length}`);
          for (const unit of course.units) {
            console.log(`      - Unit: ${unit.title}, Lessons: ${unit.lessons?.length || 0}`);
            if (unit.lessons) {
              for (const lesson of unit.lessons) {
                console.log(`        - Lesson: ${lesson.title}, Exams: ${lesson.exams?.length || 0}`);
                if (lesson.exams && lesson.exams.length > 0) {
                  for (const exam of lesson.exams) {
                    console.log(`          - Exam: ${exam.title}, userResult:`, exam.userResult);
                  }
                }
              }
            }
          }
        }
        if (course.directLessons) {
          console.log(`    - Direct lessons count: ${course.directLessons.length}`);
          for (const lesson of course.directLessons) {
            console.log(`      - Lesson: ${lesson.title}, Exams: ${lesson.exams?.length || 0}`);
            if (lesson.exams && lesson.exams.length > 0) {
              for (const exam of lesson.exams) {
                console.log(`        - Exam: ${exam.title}, userResult:`, exam.userResult);
              }
            }
          }
        }
        console.log('');
      }
    } else {
      for (const course of coursesWithExams) {
        console.log(`🏫 Course: ${course.title}`);
        
        // Check direct lessons
        if (course.directLessons) {
          for (const lesson of course.directLessons) {
            if (lesson.exams && lesson.exams.length > 0) {
              console.log(`  📖 Lesson: ${lesson.title}`);
              for (const exam of lesson.exams) {
                console.log(`    📝 Exam: ${exam.title}`);
                console.log(`      - userResult:`, exam.userResult);
                console.log(`      - hasTaken: ${exam.userResult?.hasTaken}`);
                if (exam.userResult?.hasTaken) {
                  console.log(`      - Score: ${exam.userResult.score}/${exam.userResult.totalQuestions}`);
                  console.log(`      - Percentage: ${exam.userResult.percentage}%`);
                  console.log(`      - Taken at: ${exam.userResult.takenAt}`);
                }
                console.log('');
              }
            }
          }
        }

        // Check unit lessons
        if (course.units) {
          for (const unit of course.units) {
            if (unit.lessons) {
              for (const lesson of unit.lessons) {
                if (lesson.exams && lesson.exams.length > 0) {
                  console.log(`  📖 Lesson: ${lesson.title} (Unit: ${unit.title})`);
                  for (const exam of lesson.exams) {
                    console.log(`    📝 Exam: ${exam.title}`);
                    console.log(`      - userResult:`, exam.userResult);
                    console.log(`      - hasTaken: ${exam.userResult?.hasTaken}`);
                    if (exam.userResult?.hasTaken) {
                      console.log(`      - Score: ${exam.userResult.score}/${exam.userResult.totalQuestions}`);
                      console.log(`      - Percentage: ${exam.userResult.percentage}%`);
                      console.log(`      - Taken at: ${exam.userResult.takenAt}`);
                    }
                    console.log('');
                  }
                }
              }
            }
          }
        }
      }
    }

    console.log('✅ Debug completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(debugExamResults);
