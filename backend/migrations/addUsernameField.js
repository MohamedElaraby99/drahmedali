import mongoose from 'mongoose';
import userModel from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const addUsernameField = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Get all users without username
    const usersWithoutUsername = await userModel.find({ username: { $exists: false } });
    console.log(`Found ${usersWithoutUsername.length} users without username`);

    // Add username for each user
    for (const user of usersWithoutUsername) {
      // Generate username from email (remove domain and special characters)
      let username = user.email.split('@')[0];
      username = username.replace(/[^a-zA-Z0-9_]/g, '');
      
      // Ensure username is at least 3 characters
      if (username.length < 3) {
        username = username + 'user';
      }
      
      // Ensure username is unique
      let finalUsername = username;
      let counter = 1;
      while (await userModel.findOne({ username: finalUsername })) {
        finalUsername = `${username}${counter}`;
        counter++;
      }

      // Update user with username
      await userModel.findByIdAndUpdate(user._id, { username: finalUsername });
      console.log(`Added username "${finalUsername}" to user ${user.email}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addUsernameField();
}

export default addUsernameField; 