import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../utils/mailService.js";
import userModel from "../models/user.model.js";
import crypto from "crypto";
import { promises as fs } from "fs";
import cloudinary from "../config/cloudinary.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Function to generate a random 6-digit code (using crypto for better security)
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email exists" });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ email, name, role, passwordHash });
    await user.save();
    return res.status(201).json({ email, name, role });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.expiresAt = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes
    await user.save();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Green Hydrogen Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    };
    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ status: "success", message: "Verification code sent to email" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Verify code
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const admin = await userModel.findOne({ email });

    if (!admin) {
      return res
        .status(404)
        .json({ status: "error", message: "Admin not found" });
    }

    if (!admin.verificationCode) {
      return res.status(400).json({
        status: "error",
        message: "Verification code not found for this user.",
      });
    }

    if (admin.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ status: "error", message: "Verification code expired" });
    }

    if (admin.verificationCode !== code) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid verification code" });
    }

    admin.verificationCode = undefined;
    admin.expiresAt = undefined;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "3h", subject: admin._id.toString() }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: "success",
      message: "Verification successful, login successful",
    });
  } catch (error) {
    console.error("Error during verification:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const profile = async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user);
};

export const logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
};

export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "profilePicture file is required." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const folder = process.env.CLOUDINARY_PROFILE_FOLDER || "profile-pictures";

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder,
      public_id: `user_${user._id}_${Date.now()}`,
      overwrite: true,
      use_filename: true,
    });

    user.profilePictureUrl = uploadResult.secure_url;
    await user.save();

    return res.json({
      message: "Profile picture updated successfully.",
      data: {
        profilePictureUrl: user.profilePictureUrl,
      },
    });
  } catch (error) {
    return next(error);
  } finally {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }
};
