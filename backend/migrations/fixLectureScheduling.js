import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/almongezz

async function fixLectureScheduling() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get the Course model
    const Course = mongoose.model('Course', new mongoose.Schema({}));

    console.log('Finding courses with lectures that need scheduling fields...');
    
    // Find all courses
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses`);

    let updatedCourses = 0;
    let updatedLectures = 0;

    for (const course of courses) {
      let courseUpdated = false;

      // Fix units lessons
      if (course.units && Array.isArray(course.units)) {
        for (const unit of course.units) {
          if (unit.lessons && Array.isArray(unit.lessons)) {
            for (const lesson of unit.lessons) {
              if (lesson.lecture && (!lesson.lecture.hasOwnProperty('isScheduled') || !lesson.lecture.hasOwnProperty('scheduledPublishDate'))) {
                lesson.lecture.isScheduled = lesson.lecture.isScheduled || false;
                lesson.lecture.scheduledPublishDate = lesson.lecture.scheduledPublishDate || null;
                courseUpdated = true;
                updatedLectures++;
              }
            }
          }
        }
      }

      // Fix direct lessons
      if (course.directLessons && Array.isArray(course.directLessons)) {
        for (const lesson of course.directLessons) {
          if (lesson.lecture && (!lesson.lecture.hasOwnProperty('isScheduled') || !lesson.lecture.hasOwnProperty('scheduledPublishDate'))) {
            lesson.lecture.isScheduled = lesson.lecture.isScheduled || false;
            lesson.lecture.scheduledPublishDate = lesson.lecture.scheduledPublishDate || null;
            courseUpdated = true;
            updatedLectures++;
          }
        }
      }

      // Fix old lectures array (if any)
      if (course.lectures && Array.isArray(course.lectures)) {
        for (const lecture of course.lectures) {
          if (lecture.lecture && (!lecture.lecture.hasOwnProperty('isScheduled') || !lecture.lecture.hasOwnProperty('scheduledPublishDate'))) {
            lecture.lecture.isScheduled = lecture.lecture.isScheduled || false;
            lecture.lecture.scheduledPublishDate = lecture.lecture.scheduledPublishDate || null;
            courseUpdated = true;
            updatedLectures++;
          }
        }
      }

      if (courseUpdated) {
        await course.save();
        updatedCourses++;
      }
    }

    console.log(`Migration completed successfully!`);
    console.log(`Updated ${updatedCourses} courses`);
    console.log(`Updated ${updatedLectures} lectures`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixLectureScheduling(); 