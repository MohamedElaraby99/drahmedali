import mongoose from "mongoose";

mongoose.set('strictQuery', false);

// Database configuration options
const dbConfig = {
    // MongoDB Atlas (Recommended for production)
    atlas: {
        uri: process.env.MONGO_URI_ATLAS || "mongodb://localhost:27017/almongezz_database",
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    },
    
    // MongoDB Compass (Local/External)
    compass: {
        uri: process.env.MONGO_URI_COMPASS || "mongodb://localhost:27017/almongezz_database",
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    
    // MongoDB Community Server
    community: {
        uri: process.env.MONGO_URI_COMMUNITY || "mongodb://localhost:27017/almongezz_database",
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    }
};

// Get database type from environment variable
const getDatabaseType = () => {
    return process.env.DB_TYPE || 'atlas'; // Default to Atlas
};

const connectToDb = async () => {
    try {
        const dbType = getDatabaseType();
        const config = dbConfig[dbType];
        
        if (!config) {
            throw new Error(`Unknown database type: ${dbType}`);
        }
        
        console.log(`🔗 Connecting to ${dbType.toUpperCase()} database...`);
        
        const conn = await mongoose.connect(config.uri, config.options);
        
        console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🌐 Database Type: ${dbType.toUpperCase()}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔄 MongoDB connection closed through app termination');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        console.log('💡 Make sure your database server is running and connection string is correct');
        console.log('📋 Available database types: atlas, compass, community');
        console.log('🔧 Set DB_TYPE environment variable to choose database type');
        process.exit(1);
    }
}

export default connectToDb; 