import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import User from '../models/user.model.js';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/almongezz');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
};

const createInteractiveSuperAdmin = async () => {
    try {
        await connectToDb();
        
        console.log('🚀 Interactive Super Admin Creator');
        console.log('================================\n');
        
        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
        if (existingSuperAdmin) {
            console.log('⚠️ Super admin already exists:');
            console.log(`📧 Email: ${existingSuperAdmin.email}`);
            console.log(`👤 Username: ${existingSuperAdmin.username}`);
            console.log(`👑 Role: ${existingSuperAdmin.role}`);
            
            const replace = await askQuestion('\n❓ Do you want to replace the existing super admin? (y/n): ');
            if (replace.toLowerCase() !== 'y' && replace.toLowerCase() !== 'yes') {
                console.log('❌ Super admin creation cancelled.');
                rl.close();
                process.exit(0);
            }
            
            // Delete existing super admin
            await User.findByIdAndDelete(existingSuperAdmin._id);
            console.log('🗑️ Existing super admin deleted.');
        }
        
        console.log('\n📝 Please enter super admin details:');
        
        const fullName = await askQuestion('Full Name (default: Super Administrator): ') || 'Super Administrator';
        const username = await askQuestion('Username (default: superadmin): ') || 'superadmin';
        const email = await askQuestion('Email (default: superadmin@api.com): ') || 'superadmin@api.com';
        
        // Ask for password or generate one
        const passwordChoice = await askQuestion('Generate random password? (y/n, default: n): ') || 'n';
        let password;
        
        if (passwordChoice.toLowerCase() === 'y' || passwordChoice.toLowerCase() === 'yes') {
            password = generateRandomPassword();
            console.log(`🔐 Generated password: ${password}`);
        } else {
            password = await askQuestion('Password (default: SuperAdmin123!): ') || 'SuperAdmin123!';
        }
        
        // Validate input
        if (!fullName || !username || !email || !password) {
            throw new Error("All fields are required!");
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });
        
        if (existingUser) {
            console.log('\n⚠️ User already exists!');
            console.log(`📧 Email: ${existingUser.email}`);
            console.log(`👤 Username: ${existingUser.username}`);
            console.log(`👑 Role: ${existingUser.role}`);
            
            const continueChoice = await askQuestion('Continue anyway? (y/n): ');
            if (continueChoice.toLowerCase() !== 'y' && continueChoice.toLowerCase() !== 'yes') {
                console.log('❌ Super admin creation cancelled.');
                rl.close();
                process.exit(0);
            }
        }
        
        // Confirm creation
        console.log('\n📋 Super Admin Account Details:');
        console.log(`👤 Full Name: ${fullName}`);
        console.log(`🔑 Username: ${username}`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔐 Password: ${password}`);
        console.log(`👑 Role: SUPER_ADMIN`);
        console.log(`🔑 Permissions: CREATE_ADMIN, DELETE_ADMIN, MANAGE_USERS, MANAGE_COURSES, MANAGE_PAYMENTS, VIEW_ANALYTICS`);
        
        const confirm = await askQuestion('\n❓ Do you want to create this super admin account? (y/n): ');
        
        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
            console.log('❌ Super admin creation cancelled.');
            rl.close();
            process.exit(0);
        }
        
        // Create super admin account
        console.log('\n👤 Creating super admin account...');
        const superAdmin = new User({
            fullName: fullName,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: password,
            role: "SUPER_ADMIN",
            adminPermissions: [
                'CREATE_ADMIN',
                'DELETE_ADMIN', 
                'MANAGE_USERS',
                'MANAGE_COURSES',
                'MANAGE_PAYMENTS',
                'VIEW_ANALYTICS'
            ],
            isActive: true
        });
        
        await superAdmin.save();
        
        console.log('\n✅ Super admin account created successfully!');
        console.log(`📧 Email: ${superAdmin.email}`);
        console.log(`👤 Username: ${superAdmin.username}`);
        console.log(`🔐 Password: ${password}`);
        console.log(`👑 Role: ${superAdmin.role}`);
        console.log(`🔑 Permissions: ${superAdmin.adminPermissions.join(', ')}`);
        console.log('\n💡 You can now login with these credentials');
        console.log('🌐 Go to: http://localhost:5173/login');
        
        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error);
        rl.close();
        process.exit(1);
    }
};

const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

createInteractiveSuperAdmin();
