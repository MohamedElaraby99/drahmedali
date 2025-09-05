import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

const removeGradeField = async () => {
    try {
        await connectDB();
        
        // Get the User model
        const userSchema = new mongoose.Schema({
            fullName: String,
            username: String,
            email: String,
            phoneNumber: String,
            fatherPhoneNumber: String,
            governorate: String,
            grade: String, // This field will be removed
            stage: mongoose.Schema.Types.ObjectId,
            age: Number,
            role: String,
            avatar: {
                public_id: String,
                secure_url: String
            },
            isActive: Boolean,
            forgotPasswordToken: String,
            forgotPasswordExpiry: Date,
            subscription: {
                id: String,
                status: String,
                plan: String,
                currentPeriodEnd: Date
            },
            wallet: {
                balance: Number,
                transactions: [{
                    type: String,
                    amount: Number,
                    code: String,
                    description: String,
                    date: Date,
                    status: String
                }]
            }
        });
        
        const User = mongoose.model('User', userSchema);
        
        // Remove the grade field from all users
        const result = await User.updateMany(
            {}, // Update all documents
            { $unset: { grade: "" } } // Remove the grade field
        );
        
        console.log(`Successfully removed grade field from ${result.modifiedCount} users`);
        
        // Verify the field is removed
        const usersWithGrade = await User.find({ grade: { $exists: true } });
        console.log(`Users still with grade field: ${usersWithGrade.length}`);
        
        if (usersWithGrade.length === 0) {
            console.log('✅ Grade field successfully removed from all users');
        } else {
            console.log('⚠️ Some users still have the grade field');
        }
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database disconnected');
        process.exit(0);
    }
};

removeGradeField(); 