import mongoose from 'mongoose';
import userModel from './models/user.model.js';
import bcrypt from 'bcrypt';

// Test phone-based authentication
async function testPhoneAuth() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/almongez');
        console.log('Connected to MongoDB');

        // Test 1: Create a user with phone number (no email)
        console.log('\n=== Test 1: Creating user with phone number only ===');
        const testUserData = {
            fullName: 'Test User',
            password: 'password123',
            phoneNumber: '01234567890',
            governorate: 'Cairo',
            stage: new mongoose.Types.ObjectId(), // You'll need a valid stage ID
            age: 25,
            role: 'USER'
        };

        const testUser = await userModel.create(testUserData);
        console.log('User created successfully:', {
            id: testUser._id,
            fullName: testUser.fullName,
            phoneNumber: testUser.phoneNumber,
            email: testUser.email,
            role: testUser.role
        });

        // Test 2: Try to login with phone number
        console.log('\n=== Test 2: Login with phone number ===');
        const loginUser = await userModel.findOne({ phoneNumber: '01234567890' }).select('+password');
        if (loginUser) {
            const isPasswordValid = await bcrypt.compare('password123', loginUser.password);
            console.log('Login successful:', isPasswordValid);
            if (isPasswordValid) {
                const token = loginUser.generateJWTToken();
                console.log('JWT Token generated:', token ? 'Success' : 'Failed');
            }
        } else {
            console.log('User not found by phone number');
        }

        // Test 3: Try to create another user with same phone number (should fail)
        console.log('\n=== Test 3: Duplicate phone number test ===');
        try {
            const duplicateUser = await userModel.create({
                ...testUserData
            });
            console.log('Duplicate user created (this should not happen)');
        } catch (error) {
            console.log('Duplicate phone number correctly rejected:', error.message);
        }

        // Test 4: Create admin user with email
        console.log('\n=== Test 4: Creating admin user with email ===');
        const adminUserData = {
            fullName: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'ADMIN'
        };

        const adminUser = await userModel.create(adminUserData);
        console.log('Admin user created successfully:', {
            id: adminUser._id,
            fullName: adminUser.fullName,
            email: adminUser.email,
            phoneNumber: adminUser.phoneNumber,
            role: adminUser.role
        });

        // Test 5: Login admin with email
        console.log('\n=== Test 5: Admin login with email ===');
        const loginAdmin = await userModel.findOne({ email: 'admin@test.com' }).select('+password');
        if (loginAdmin) {
            const isPasswordValid = await bcrypt.compare('password123', loginAdmin.password);
            console.log('Admin login successful:', isPasswordValid);
            if (isPasswordValid) {
                const token = loginAdmin.generateJWTToken();
                console.log('Admin JWT Token generated:', token ? 'Success' : 'Failed');
            }
        }

        console.log('\n=== All tests completed ===');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the test
testPhoneAuth();
