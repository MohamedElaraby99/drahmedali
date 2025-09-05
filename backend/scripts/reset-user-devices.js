import mongoose from 'mongoose';
import User from '../models/user.model.js';
import UserDevice from '../models/userDevice.model.js';
import { config } from 'dotenv';

config();

const resetUserDevices = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to database');

        // Get user email/username to reset
        const userIdentifier = process.argv[2];
        if (!userIdentifier) {
            console.log('Usage: node reset-user-devices.js <email_or_username>');
            process.exit(1);
        }

        // Find user
        const user = await User.findOne({
            $or: [
                { email: userIdentifier },
                { username: userIdentifier }
            ]
        });

        if (!user) {
            console.log(`User not found: ${userIdentifier}`);
            process.exit(1);
        }

        console.log(`Found user: ${user.username} (${user.email})`);

        // Find and display current devices
        const currentDevices = await UserDevice.find({ user: user._id });
        console.log(`\nCurrent devices (${currentDevices.length}):`);
        currentDevices.forEach((device, index) => {
            console.log(`  ${index + 1}. ${device.deviceName} - ${device.deviceInfo?.browser} on ${device.deviceInfo?.os}`);
            console.log(`     Last activity: ${device.lastActivity}`);
            console.log(`     Active: ${device.isActive}`);
        });

        // Reset devices
        const deleteResult = await UserDevice.deleteMany({ user: user._id });
        console.log(`\n✅ Deleted ${deleteResult.deletedCount} devices for user ${user.username}`);
        console.log(`🔄 User can now register up to 2 new devices`);

    } catch (error) {
        console.error('Error resetting user devices:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
};

resetUserDevices();
