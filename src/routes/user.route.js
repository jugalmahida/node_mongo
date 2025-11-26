import express from "express";
import {
  register,
  login,
  verifyCode,
  logout,
  profile,
  uploadProfilePicture,
} from "../controllers/user.controller.js";
import { auth } from "../middlewares/authmiddleware.js";
import { uploadImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-code", verifyCode);
router.get("/profile", auth, profile);
router.post("/logout", auth, logout);
router.post(
  "/profile-picture",
  auth,
  uploadImage.single("profilePicture"),
  uploadProfilePicture
);

export default router;
