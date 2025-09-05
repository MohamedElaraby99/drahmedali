import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/almongezz';

async function cleanupVideoProgress() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get the VideoProgress collection
    const VideoProgress = mongoose.connection.collection('videoprogresses');

    // Find all documents with the old checkpoints field
    const documentsWithOldCheckpoints = await VideoProgress.find({
      checkpoints: { $exists: true }
    }).toArray();

    console.log(`Found ${documentsWithOldCheckpoints.length} documents with old checkpoints field`);

    if (documentsWithOldCheckpoints.length > 0) {
      // Remove the checkpoints field from all documents
      const result = await VideoProgress.updateMany(
        { checkpoints: { $exists: true } },
        { $unset: { checkpoints: 1 } }
      );

      console.log(`Updated ${result.modifiedCount} documents - removed old checkpoints field`);
    }

    // Also ensure totalWatchTime field exists and is a number
    const documentsWithoutWatchTime = await VideoProgress.find({
      $or: [
        { totalWatchTime: { $exists: false } },
        { totalWatchTime: { $type: "array" } } // If it's an array, it's wrong
      ]
    }).toArray();

    console.log(`Found ${documentsWithoutWatchTime.length} documents with missing or incorrect totalWatchTime`);

    if (documentsWithoutWatchTime.length > 0) {
      const result = await VideoProgress.updateMany(
        {
          $or: [
            { totalWatchTime: { $exists: false } },
            { totalWatchTime: { $type: "array" } }
          ]
        },
        { $set: { totalWatchTime: 0 } }
      );

      console.log(`Updated ${result.modifiedCount} documents - fixed totalWatchTime field`);
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
cleanupVideoProgress(); 