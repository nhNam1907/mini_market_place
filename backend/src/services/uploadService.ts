import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import { AppError, ErrorCode } from "../lib/errors.js";
import { cloudinary } from "../lib/cloudinary.js";

const MAX_PRODUCT_IMAGES = 5;

export type UploadProductImageInput = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  sellerId: string;
};

export type UploadedProductImage = {
  imageUrl: string;
  imageKey: string;
  sortOrder: number;
};

function normalizeExtension(fileName: string, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  const extension = extname(fileName).replace(".", "").toLowerCase();
  return extension || "bin";
}

async function uploadProductImageToCloudinary(
  params: UploadProductImageInput,
  folder: string,
) {
  const { buffer, fileName, mimeType, sellerId } = params;

  if (!buffer || !fileName || !mimeType || !sellerId) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "buffer, fileName, mimeType, and sellerId are required",
    );
  }

  const extension = normalizeExtension(fileName, mimeType);
  const publicId = randomUUID();

  return new Promise<{ imageUrl: string; imageKey: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        format: extension,
      },
      (error, result) => {
        if (error || !result) {
          reject(
            new AppError(
              ErrorCode.INTERNAL_ERROR,
              500,
              error?.message ?? "Failed to upload image to Cloudinary",
            ),
          );
          return;
        }

        resolve({
          imageUrl: result.secure_url,
          imageKey: result.public_id,
        });
      },
    );

    uploadStream.end(buffer);
  });
}

export async function uploadTestProductImage(params: UploadProductImageInput) {
  return uploadProductImageToCloudinary(params, `products/test/${params.sellerId}`);
}

export async function uploadProductImages(
  params: UploadProductImageInput[],
): Promise<UploadedProductImage[]> {
  if (!params || params.length === 0) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "buffer, fileName, mimeType, and sellerId are required",
    );
  }

  if (params.length > MAX_PRODUCT_IMAGES) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      `You can upload at most ${MAX_PRODUCT_IMAGES} images`,
    );
  }

  const uploadedImages = await Promise.all(
    params.map(async (item, index) => {
      const uploadedImage = await uploadProductImageToCloudinary(
        item,
        `products/${item.sellerId}`,
      );

      return {
        ...uploadedImage,
        sortOrder: index,
      };
    }),
  );

  return uploadedImages;
}

export async function deleteProductImages(imageKeys: string[]) {
  await Promise.allSettled(
    imageKeys.map((imageKey) =>
      cloudinary.uploader.destroy(imageKey, {
        resource_type: "image",
      }),
    ),
  );
}
