/**
 * Migration to remove username index and field from users collection
 * This fixes the E11000 duplicate key error for username field
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const removeUsernameIndex = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drahmedali');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Check if username index exists
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(idx => idx.name));

        // Remove username index if it exists
        const usernameIndexExists = indexes.some(idx => 
            idx.name === 'username_1' || 
            (idx.key && idx.key.username)
        );

        if (usernameIndexExists) {
            console.log('Removing username index...');
            try {
                await collection.dropIndex('username_1');
                console.log('✅ Username index removed successfully');
            } catch (error) {
                if (error.code === 27) {
                    console.log('⚠️ Username index does not exist (already removed)');
                } else {
                    console.error('Error removing username index:', error.message);
                }
            }
        } else {
            console.log('ℹ️ Username index does not exist');
        }

        // Remove username field from all documents
        console.log('Removing username field from all user documents...');
        const result = await collection.updateMany(
            { username: { $exists: true } },
            { $unset: { username: "" } }
        );
        
        console.log(`✅ Username field removed from ${result.modifiedCount} documents`);

        // Verify the changes
        const usersWithUsername = await collection.countDocuments({ username: { $exists: true } });
        console.log(`Documents with username field remaining: ${usersWithUsername}`);

        console.log('✅ Migration completed successfully');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
    removeUsernameIndex()
        .then(() => {
            console.log('🎉 Username index removal migration completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

export default removeUsernameIndex;
