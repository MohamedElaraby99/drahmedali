#!/usr/bin/env node

import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to ask questions
const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
};

const connectToDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/almongezz', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        return false;
    }
};

const deleteAdminUser = async () => {
    console.log("🗑️ api Admin User Deletion Tool");
    console.log("===============================\n");
    
    try {
        // Connect to database
        const connected = await connectToDb();
        if (!connected) {
            process.exit(1);
        }
        
        // Find all admin users
        const adminUsers = await User.find({ role: 'ADMIN' });
        
        if (adminUsers.length === 0) {
            console.log("ℹ️ No admin users found in the database.");
            process.exit(0);
        }
        
        console.log(`📋 Found ${adminUsers.length} admin user(s):\n`);
        
        // Display all admin users
        adminUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.fullName}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   👤 Username: ${user.username}`);
            console.log(`   🆔 ID: ${user._id}`);
            console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
            console.log("");
        });
        
        // Choose deletion mode
        console.log("🗑️ Choose deletion mode:");
        console.log("1. Delete specific admin user");
        console.log("2. Delete all admin users");
        console.log("3. Delete admin by email");
        console.log("4. Delete admin by username");
        
        const mode = await askQuestion("\nEnter mode (1-4): ");
        
        let userToDelete = null;
        
        switch (mode) {
            case "1":
                // Delete specific admin user by selection
                const selection = parseInt(await askQuestion(`Enter user number (1-${adminUsers.length}): `));
                if (selection >= 1 && selection <= adminUsers.length) {
                    userToDelete = adminUsers[selection - 1];
                } else {
                    console.log("❌ Invalid selection.");
                    process.exit(1);
                }
                break;
                
            case "2":
                // Delete all admin users
                console.log("\n⚠️ WARNING: This will delete ALL admin users!");
                const confirmAll = await askQuestion("Are you sure you want to delete ALL admin users? (yes/no): ");
                if (confirmAll.toLowerCase() !== 'yes') {
                    console.log("❌ Operation cancelled.");
                    process.exit(0);
                }
                
                // Delete all admin users
                const deleteResult = await User.deleteMany({ role: 'ADMIN' });
                console.log(`✅ Successfully deleted ${deleteResult.deletedCount} admin user(s).`);
                process.exit(0);
                
            case "3":
                // Delete admin by email
                const email = await askQuestion("Enter admin email: ");
                userToDelete = await User.findOne({ email: email.toLowerCase(), role: 'ADMIN' });
                if (!userToDelete) {
                    console.log("❌ Admin user with that email not found.");
                    process.exit(1);
                }
                break;
                
            case "4":
                // Delete admin by username
                const username = await askQuestion("Enter admin username: ");
                userToDelete = await User.findOne({ username: username.toLowerCase(), role: 'ADMIN' });
                if (!userToDelete) {
                    console.log("❌ Admin user with that username not found.");
                    process.exit(1);
                }
                break;
                
            default:
                console.log("❌ Invalid mode selected.");
                process.exit(1);
        }
        
        if (userToDelete) {
            // Show user details and confirm deletion
            console.log("\n📋 User to delete:");
            console.log(`👤 Full Name: ${userToDelete.fullName}`);
            console.log(`📧 Email: ${userToDelete.email}`);
            console.log(`🔑 Username: ${userToDelete.username}`);
            console.log(`🆔 ID: ${userToDelete._id}`);
            console.log(`📅 Created: ${userToDelete.createdAt.toLocaleDateString()}`);
            
            const confirm = await askQuestion("\n❓ Are you sure you want to delete this admin user? (yes/no): ");
            
            if (confirm.toLowerCase() !== 'yes') {
                console.log("❌ Deletion cancelled.");
                process.exit(0);
            }
            
            // Delete the user
            await User.findByIdAndDelete(userToDelete._id);
            
            console.log("✅ Admin user deleted successfully!");
            console.log(`🗑️ Deleted: ${userToDelete.fullName} (${userToDelete.email})`);
        }
        
    } catch (error) {
        console.error("❌ Error deleting admin user:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
        rl.close();
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    deleteAdminUser();
}

export default deleteAdminUser;
