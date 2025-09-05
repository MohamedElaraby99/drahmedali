import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Set default environment variables if not provided (same as server.js)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/drahmedali';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'https://drahmedali.online'; 
process.env.BACKEND_URL = process.env.BACKEND_URL || 'https://api.drahmedali.online';

const MONGODB_URI = process.env.MONGODB_URI;

async function fixEmailUniqueConstraint() {
  try {
    console.log('Starting email unique constraint fix...');
    console.log('MongoDB URI:', MONGODB_URI);
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get the users collection
    const usersCollection = mongoose.connection.collection('users');

    // Find all users with null email
    const usersWithNullEmail = await usersCollection.find({ email: null }).toArray();
    console.log(`Found ${usersWithNullEmail.length} users with null email`);

    if (usersWithNullEmail.length > 0) {
      // Update users with null email to have undefined email (which will be excluded from unique index)
      const result = await usersCollection.updateMany(
        { email: null },
        { $unset: { email: 1 } }
      );

      console.log(`Updated ${result.modifiedCount} users - removed null email field`);
    }

    // Also check for empty string emails
    const usersWithEmptyEmail = await usersCollection.find({ email: "" }).toArray();
    console.log(`Found ${usersWithEmptyEmail.length} users with empty email`);

    if (usersWithEmptyEmail.length > 0) {
      // Update users with empty email to have undefined email
      const result = await usersCollection.updateMany(
        { email: "" },
        { $unset: { email: 1 } }
      );

      console.log(`Updated ${result.modifiedCount} users - removed empty email field`);
    }

    // Drop the existing email index to recreate it properly
    try {
      await usersCollection.dropIndex('email_1');
      console.log('Dropped existing email index');
    } catch (error) {
      console.log('Email index may not exist or already dropped:', error.message);
    }

    // Create a new sparse unique index on email
    await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('Created new sparse unique index on email field');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
  console.log('Running migration script...');
  fixEmailUniqueConstraint();
} else {
  console.log('Script loaded but not executed directly');
}

export default fixEmailUniqueConstraint;
