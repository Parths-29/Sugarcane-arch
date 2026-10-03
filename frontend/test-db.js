import mongoose from 'mongoose';
import User from './backend/models/User.js';

const uri = "mongodb+srv://parthsharma:Parth123@cluster0.cigwn9p.mongodb.net/agriculture?appName=Cluster0";

async function test() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    
    const newUser = new User({
      name: "Test User",
      phone: "1234567890",
      password: "password123",
      village: "Test Village",
      language: "en"
    });
    
    await newUser.save();
    console.log("User saved successfully");
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

test();
