const mongoose = require("mongoose");
require("dotenv").config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_CONNECTION).then(()=>{
      console.log("MongoDB connected successfully.", );
    })
  } catch (err) {
    console.log("MongoDB connection error:", err.message);
    throw new Error(`MongoDB connection error: ${err.message}`);
  }
};

module.exports = connectDB;
