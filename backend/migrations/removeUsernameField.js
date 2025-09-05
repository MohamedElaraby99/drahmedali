import mongoose from 'mongoose';
import userModel from '../models/user.model.js';

// Migration to remove username field from all users
export async function removeUsernameField() {
    try {
        console.log('🚀 Starting username field removal migration...');
        
        // Remove username field from all documents
        const result = await userModel.updateMany(
            {}, 
            { $unset: { username: "" } }
        );
        
        console.log(`✅ Migration completed! Updated ${result.modifiedCount} users.`);
        
        // Verify the migration
        const usersWithUsername = await userModel.countDocuments({ username: { $exists: true } });
        console.log(`📊 Users still with username field: ${usersWithUsername}`);
        
        if (usersWithUsername === 0) {
            console.log('✨ All username fields have been successfully removed!');
        } else {
            console.log('⚠️  Some users still have username field. Manual cleanup may be required.');
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/drahmedali');
    await removeUsernameField();
    await mongoose.disconnect();
    process.exit(0);
}
