import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        
        // Check if using Atlas or local MongoDB
        const isAtlas = mongoURI.includes('mongodb+srv');
        
        await mongoose.connect(mongoURI);
        
        if (isAtlas) {
            console.log("✅ Connected to MongoDB Atlas successfully");
            console.log("🌍 Database: Cloud (Atlas)");
        } else {
            console.log("✅ Connected to Local MongoDB successfully");
            console.log("💻 Database: Local");
        }
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        if (err.message.includes('authentication failed')) {
            console.error('🔑 Check your MongoDB Atlas username/password');
        }
        if (err.message.includes('ENOTFOUND')) {
            console.error('🌐 Check your internet connection and cluster URL');
        }
        process.exit(1);
    }
}