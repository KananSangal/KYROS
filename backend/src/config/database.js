const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    console.log(
      "🔗 MongoDB URI loaded:",
      process.env.MONGODB_URI
        ? "YES"
        : "NO"
    );

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    console.log("🍃 MongoDB connected successfully");
    console.log("📦 Database:", mongoose.connection.name);
    console.log("🌐 Host:", mongoose.connection.host);

  } catch (error) {

    console.error("");
    console.error("========================================");
    console.error("❌ MONGODB CONNECTION FAILED");
    console.error("========================================");

    console.error("Name:", error.name);
    console.error("Message:", error.message);

    if (error.reason) {
      console.error("Reason:", error.reason);
    }

    if (error.cause) {
      console.error("Cause:", error.cause);
    }

    console.error("========================================");
    console.error("");

    process.exit(1);
  }
};

module.exports = connectDB;