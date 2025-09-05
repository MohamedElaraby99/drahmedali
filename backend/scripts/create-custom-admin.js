#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import User from "../models/user.model.js";

// Load environment variables
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
            resolve(answer);
        });
    });
};

const createCustomAdmin = async () => {
    console.log("🚀 Admin Account Creator");
    console.log("========================\n");
    
    try {
        // Get database type and connection string
        const dbType = process.env.DB_TYPE || 'atlas';
        console.log(`📊 Database Type: ${dbType.toUpperCase()}`);
        
        let uri;
        switch (dbType) {
            case 'atlas':
                uri = process.env.MONGO_URI_ATLAS;
                break;
            case 'compass':
                uri = process.env.MONGO_URI_COMPASS;
                break;
            case 'community':
                uri = process.env.MONGO_URI_COMMUNITY;
                break;
            default:
                throw new Error(`Unknown database type: ${dbType}`);
        }
        
        if (!uri) {
            throw new Error(`No connection string found for ${dbType}`);
        }
        
        console.log(`🔗 Connecting to database...`);
        
        // Connect to database
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log("✅ Database connected successfully!\n");
        
        // Get admin details from user
        console.log("📝 Please enter admin details:");
        
        const fullName = await askQuestion("Full Name: ");
        const username = await askQuestion("Username: ");
        const email = await askQuestion("Email: ");
        const password = await askQuestion("Password: ");
        
        // Validate input
        if (!fullName || !username || !email || !password) {
            throw new Error("All fields are required!");
        }
        
        if (password.length < 4) {
            throw new Error("Password must be at least 4 characters!");
        }
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });
        
        if (existingAdmin) {
            console.log("\n⚠️ Admin account already exists!");
            console.log(`📧 Email: ${existingAdmin.email}`);
            console.log(`👤 Username: ${existingAdmin.username}`);
            console.log(`🔑 Role: ${existingAdmin.role}`);
            return;
        }
        
        // Confirm creation
        console.log("\n📋 Admin Account Details:");
        console.log(`👤 Full Name: ${fullName}`);
        console.log(`🔑 Username: ${username}`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔐 Password: ${password}`);
        console.log(`👑 Role: ADMIN`);
        
        const confirm = await askQuestion("\n❓ Do you want to create this admin account? (y/n): ");
        
        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
            console.log("❌ Admin account creation cancelled.");
            return;
        }
        
        // Create admin account
        console.log("\n👤 Creating admin account...");
        const admin = new User({
            fullName: fullName,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: password,
            role: "ADMIN",
            isActive: true
        });
        
        await admin.save();
        
        console.log("✅ Admin account created successfully!");
        console.log(`📧 Email: ${admin.email}`);
        console.log(`👤 Username: ${admin.username}`);
        console.log(`🔑 Role: ${admin.role}`);
        console.log(`🔐 Password: ${password}`);
        console.log("\n💡 You can now login with these credentials");
        console.log("🌐 Go to: http://localhost:5173/login");
        
    } catch (error) {
        console.error("❌ Error creating admin account:", error.message);
        console.log("\n💡 Troubleshooting tips:");
        console.log("1. Check your database connection");
        console.log("2. Verify your .env file settings");
        console.log("3. Ensure database server is running");
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
        rl.close();
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createCustomAdmin();
}

export default createCustomAdmin; 