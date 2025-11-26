import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedOriginalName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${sanitizedOriginalName}`);
  },
});

const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (!supportedMimeTypes.includes(file.mimetype)) {
    cb(new Error("Only JPG, PNG or WEBP images are allowed."));
  } else {
    cb(null, true);
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_PROFILE_PIC_SIZE || 2 * 1024 * 1024),
  },
});
