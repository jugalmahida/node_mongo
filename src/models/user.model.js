import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["GOVERNMENT", "STARTUP", "AUDITOR"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  verificationCode: { type: String },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
