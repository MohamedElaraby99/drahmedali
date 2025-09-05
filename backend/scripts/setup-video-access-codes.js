#!/usr/bin/env node

/**
 * Script to set up video access codes for testing the new video access feature
 * Usage: node backend/scripts/setup-video-access-codes.js
 */

import mongoose from 'mongoose';
import Course from '../models/course.model.js';
import CourseAccessCode from '../models/courseAccessCode.model.js';
import '../config/database.config.js';

const setupVideoAccessCodes = async () => {
  try {
    console.log('🚀 Setting up video access codes for testing...\n');

    // Find the first course with videos
    const course = await Course.findOne({
      $or: [
        { 'directLessons.videos.0': { $exists: true } },
        { 'units.lessons.videos.0': { $exists: true } }
      ]
    });

    if (!course) {
      console.log('❌ No courses with videos found. Please create a course with videos first.');
      return;
    }

    console.log(`✅ Found course: "${course.title}" (${course._id})`);

    // Update the first video in direct lessons to require access code
    let videoUpdated = false;
    if (course.directLessons && course.directLessons.length > 0) {
      const lesson = course.directLessons[0];
      if (lesson.videos && lesson.videos.length > 0) {
        lesson.videos[0].requiresAccessCode = true;
        lesson.videos[0].premium = true;
        videoUpdated = true;
        console.log(`✅ Updated video "${lesson.videos[0].title}" in direct lesson "${lesson.title}" to require access code`);
      }
    }

    // Update the first video in a unit lesson to require access code
    if (!videoUpdated && course.units && course.units.length > 0) {
      for (const unit of course.units) {
        if (unit.lessons && unit.lessons.length > 0) {
          const lesson = unit.lessons[0];
          if (lesson.videos && lesson.videos.length > 0) {
            lesson.videos[0].requiresAccessCode = true;
            lesson.videos[0].premium = true;
            videoUpdated = true;
            console.log(`✅ Updated video "${lesson.videos[0].title}" in lesson "${lesson.title}" (unit: "${unit.title}") to require access code`);
            break;
          }
        }
      }
    }

    if (!videoUpdated) {
      console.log('❌ No videos found to update. Please add videos to your course first.');
      return;
    }

    // Save the course changes
    await course.save();
    console.log('✅ Course updated successfully');

    // Generate some access codes for this course
    const accessCodes = [];
    const now = new Date();
    const accessStartAt = now;
    const accessEndAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    const codeExpiresAt = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 days from now

    for (let i = 0; i < 5; i++) {
      let codeValue;
      let isUnique = false;
      while (!isUnique) {
        codeValue = CourseAccessCode.generateCode();
        const exists = await CourseAccessCode.findOne({ code: codeValue });
        if (!exists) isUnique = true;
      }

      const accessCode = await CourseAccessCode.create({
        code: codeValue,
        courseId: course._id,
        accessStartAt,
        accessEndAt,
        codeExpiresAt,
        createdBy: null // Will need admin user for production
      });

      accessCodes.push(accessCode);
    }

    console.log('\n🎉 Generated access codes for testing:');
    console.log('═'.repeat(50));
    accessCodes.forEach((code, index) => {
      console.log(`${index + 1}. Code: ${code.code}`);
      console.log(`   Valid from: ${code.accessStartAt.toISOString()}`);
      console.log(`   Valid until: ${code.accessEndAt.toISOString()}`);
      console.log(`   Code expires: ${code.codeExpiresAt.toISOString()}`);
      console.log('');
    });

    console.log('📝 Instructions for testing:');
    console.log('1. Navigate to the course in your frontend application');
    console.log('2. Click on a lesson to open the lesson modal');
    console.log('3. Try to click on a video that requires access code');
    console.log('4. Enter one of the codes above when prompted');
    console.log('5. The video should unlock and play');
    console.log('\n✨ Happy testing!');

  } catch (error) {
    console.error('❌ Error setting up video access codes:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
setupVideoAccessCodes();
