import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/almongezz';

async function fixInconsistentProgress() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get the VideoProgress collection
    const VideoProgress = mongoose.connection.collection('videoprogresses');

    // Find documents with inconsistent data
    const inconsistentProgress = await VideoProgress.find({
      $and: [
        { currentTime: 0 }, // 0 current time
        { 'reachedPercentages.0': { $exists: true } } // But has reached percentages
      ]
    }).toArray();

    console.log(`Found ${inconsistentProgress.length} documents with inconsistent progress data`);

    if (inconsistentProgress.length > 0) {
      // Fix the inconsistent data by clearing reached percentages
      const result = await VideoProgress.updateMany(
        {
          $and: [
            { currentTime: 0 },
            { 'reachedPercentages.0': { $exists: true } }
          ]
        },
        {
          $set: {
            reachedPercentages: [],
            isCompleted: false
          }
        }
      );

      console.log(`Fixed ${result.modifiedCount} documents - cleared inconsistent reached percentages`);
    }

    // Also fix documents where progress is 0 but isCompleted is true
    const completedWithZeroProgress = await VideoProgress.find({
      $and: [
        { currentTime: 0 },
        { isCompleted: true }
      ]
    }).toArray();

    console.log(`Found ${completedWithZeroProgress.length} documents marked as completed with 0 progress`);

    if (completedWithZeroProgress.length > 0) {
      const result = await VideoProgress.updateMany(
        {
          $and: [
            { currentTime: 0 },
            { isCompleted: true }
          ]
        },
        {
          $set: {
            isCompleted: false
          }
        }
      );

      console.log(`Fixed ${result.modifiedCount} documents - unmarked as completed`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixInconsistentProgress(); 