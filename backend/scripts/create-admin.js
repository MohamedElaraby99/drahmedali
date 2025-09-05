#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

// Load environment variables
dotenv.config();

const createAdminAccount = async () => {
    console.log("🚀 Creating admin account...");
    
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
        
        console.log("✅ Database connected successfully!");
        
        // Admin account details
        const adminData = {
            fullName: "Admin User",
            username: "admin",
            email: "admin@api.com",
            password: "admin123456",
            role: "ADMIN",
            isActive: true
        };
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            $or: [
                { email: adminData.email },
                { username: adminData.username }
            ]
        });
        
        if (existingAdmin) {
            console.log("⚠️ Admin account already exists!");
            console.log(`📧 Email: ${existingAdmin.email}`);
            console.log(`👤 Username: ${existingAdmin.username}`);
            console.log(`🔑 Role: ${existingAdmin.role}`);
            return;
        }
        
        // Create admin account
        console.log("👤 Creating admin account...");
        const admin = new User(adminData);
        await admin.save();
        
        console.log("✅ Admin account created successfully!");
        console.log(`📧 Email: ${admin.email}`);
        console.log(`👤 Username: ${admin.username}`);
        console.log(`🔑 Role: ${admin.role}`);
        console.log(`🔐 Password: ${adminData.password}`);
        console.log("\n💡 You can now login with these credentials");
        
    } catch (error) {
        console.error("❌ Error creating admin account:", error.message);
        console.log("\n💡 Troubleshooting tips:");
        console.log("1. Check your database connection");
        console.log("2. Verify your .env file settings");
        console.log("3. Ensure database server is running");
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createAdminAccount();
}

export default createAdminAccount; 