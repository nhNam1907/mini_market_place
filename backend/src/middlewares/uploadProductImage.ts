import multer from "multer";

import { AppError, ErrorCode } from "../lib/errors.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const storage = multer.memoryStorage();

export const uploadSingleProductImage = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new AppError(
          ErrorCode.VALIDATION_FAILED,
          400,
          "Only JPEG, PNG, and WEBP images are allowed",
        ),
      );
      return;
    }

    callback(null, true);
  },
}).single("image");

export const uploadProductImages = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 5,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new AppError(
          ErrorCode.VALIDATION_FAILED,
          400,
          "Only JPEG, PNG, and WEBP images are allowed",
        ),
      );
      return;
    }

    callback(null, true);
  },
}).array("images", 5);

