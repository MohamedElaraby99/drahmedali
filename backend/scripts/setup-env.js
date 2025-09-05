#!/usr/bin/env node

import readline from "readline";
import fs from "fs";
import path from "path";

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

const setupEnvironment = async () => {
    console.log("🔧 api Environment Setup");
    console.log("========================\n");
    
    try {
        const envPath = path.join(process.cwd(), '.env');
        
        // Check if .env file already exists
        if (fs.existsSync(envPath)) {
            console.log("⚠️ .env file already exists!");
            const overwrite = await askQuestion("Do you want to overwrite it? (y/n): ");
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log("❌ Setup cancelled.");
                return;
            }
        }
        
        console.log("📝 Please provide your database configuration:\n");
        
        // Database type
        console.log("Choose your database type:");
        console.log("1. MongoDB Atlas (Cloud)");
        console.log("2. MongoDB Compass (Local)");
        console.log("3. MongoDB Community (Local)");
        
        const dbChoice = await askQuestion("\nEnter choice (1-3): ");
        
        let dbType, dbUri;
        
        switch (dbChoice) {
            case "1":
                dbType = "atlas";
                console.log("\n📊 MongoDB Atlas Configuration");
                console.log("Format: mongodb+srv://username:password@cluster.mongodb.net/database");
                dbUri = await askQuestion("Enter your MongoDB Atlas connection string: ");
                break;
            case "2":
                dbType = "compass";
                console.log("\n📊 MongoDB Compass Configuration");
                dbUri = await askQuestion("Enter your MongoDB Compass connection string (default: mongodb://localhost:27017/almongezz): ") || "mongodb://localhost:27017/almongezz";
                break;
            case "3":
                dbType = "community";
                console.log("\n📊 MongoDB Community Configuration");
                dbUri = await askQuestion("Enter your MongoDB Community connection string (default: mongodb://localhost:27017/almongezz): ") || "mongodb://localhost:27017/almongezz";
                break;
            default:
                console.log("❌ Invalid choice. Using MongoDB Atlas.");
                dbType = "atlas";
                dbUri = await askQuestion("Enter your MongoDB Atlas connection string: ");
        }
        
        if (!dbUri) {
            console.log("❌ Database connection string is required!");
            return;
        }
        
        // Server port
        const port = await askQuestion("\nEnter server port (default: 4007): ") || "4007";
        
        // JWT secret
        const jwtSecret = await askQuestion("\nEnter JWT secret (default: api_jwt_secret_2024): ") || "api_jwt_secret_2024";
        
        // Client URL
        const clientUrl = await askQuestion("\nEnter client URL (default: http://localhost:5173): ") || "http://localhost:5173";
        
        // Build .env content
        const envContent = `# Database Configuration
DB_TYPE=${dbType}

# MongoDB Connection Strings
MONGO_URI_ATLAS=${dbType === 'atlas' ? dbUri : ''}
MONGO_URI_COMPASS=${dbType === 'compass' ? dbUri : ''}
MONGO_URI_COMMUNITY=${dbType === 'community' ? dbUri : ''}

# Alternative MongoDB URI
MONGO_URI=${dbUri}

# Server Configuration
PORT=${port}
NODE_ENV=development

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Client URL (for CORS)
CLIENT_URL=${clientUrl}

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads
`;
        
        // Write .env file
        fs.writeFileSync(envPath, envContent);
        
        console.log("\n✅ .env file created successfully!");
        console.log(`📁 Location: ${envPath}`);
        console.log("\n📋 Configuration Summary:");
        console.log(`   Database Type: ${dbType.toUpperCase()}`);
        console.log(`   Server Port: ${port}`);
        console.log(`   Client URL: ${clientUrl}`);
        console.log("\n💡 You can now run the admin creation script:");
        console.log("   node scripts/create-admin-account.js");
        
    } catch (error) {
        console.error("❌ Error setting up environment:", error.message);
    } finally {
        rl.close();
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupEnvironment();
}

export default setupEnvironment;
