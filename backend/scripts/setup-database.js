#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

const setupDatabase = async () => {
    console.log("🚀 Setting up database connection...");
    
    try {
        // Test database connection
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
        
        console.log(`🔗 Testing connection to: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
        
        // Connect to database
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log("✅ Database connection successful!");
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);
        
        // Test basic operations
        console.log("🧪 Testing database operations...");
        
        // Create a test collection
        const testCollection = mongoose.connection.collection('test');
        await testCollection.insertOne({ test: true, timestamp: new Date() });
        console.log("✅ Write operation successful");
        
        const result = await testCollection.findOne({ test: true });
        console.log("✅ Read operation successful");
        
        await testCollection.deleteOne({ test: true });
        console.log("✅ Delete operation successful");
        
        console.log("🎉 Database setup completed successfully!");
        
    } catch (error) {
        console.error("❌ Database setup failed:", error.message);
        console.log("\n💡 Troubleshooting tips:");
        console.log("1. Check your connection string");
        console.log("2. Verify database credentials");
        console.log("3. Ensure database server is running");
        console.log("4. Check network connectivity");
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
    }
};

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupDatabase();
}

export default setupDatabase; 