import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // Auto-resize on upload: bound within 1400×1800 (never upscale),
    // best quality/format decided by Cloudinary. Upload originals as-is.
    transformation: [
      { width: 1400, height: 1800, crop: "limit", quality: "auto:good", fetch_format: "auto" },
    ],
  },
});

const upload = multer({
  storage,
  limits: {
    // Cloudinary free tier allows up to 10MB per asset.
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;
