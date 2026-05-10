import { AppError, ErrorCode } from "../lib/errors.js";
import { getRequestUser } from "../lib/requestUser.js";
import { uploadProductImages, uploadTestProductImage } from "../services/uploadService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadTestProductImageHandler = asyncHandler(async (req, res) => {
  const user = getRequestUser(req);
  const file = req.file;

  if (!file) {
    throw new AppError(ErrorCode.MISSING_FIELDS, 400, "Image file is required");
  }

  const result = await uploadTestProductImage({
    buffer: file.buffer,
    fileName: file.originalname,
    mimeType: file.mimetype,
    sellerId: user.userId,
  });

  return res.status(201).json({
    success: true,
    message: "Image uploaded successfully",
    data: result,
  });
});

export const uploadProductImagesHandler = asyncHandler(async (req, res) => {
  const user = getRequestUser(req);
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError(ErrorCode.MISSING_FIELDS, 400, "Image file is required");
  }

  console.log(files.length);
  console.log(files.map((file) => file.originalname));

  const dataFile = files.map((file) => {
    return {
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sellerId: user.userId,
    };
  });

  const result = await uploadProductImages(dataFile);

  return res.status(201).json({
    success: true,
    message: "Image uploaded successfully",
    data: result,
  });
});

