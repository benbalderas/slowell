// Cloudinary upload helper — server-only.
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  publicId?: string;
}

/**
 * Upload an image from a remote URL to Cloudinary.
 * Cloudinary fetches the source URL itself — no local download needed.
 *
 * On failure (Cloudinary down, source URL unreachable, config missing) we
 * return the original sourceUrl so the caller can degrade gracefully.
 */
export async function uploadFromUrl(
  sourceUrl: string,
  opts: UploadOptions = {},
): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn("[cloudinary] not configured; falling back to source URL");
    return sourceUrl;
  }

  try {
    const result = await cloudinary.uploader.upload(sourceUrl, {
      folder: opts.folder ?? "slowell/covers",
      public_id: opts.publicId,
      overwrite: false,
      // skip if a public_id already exists with matching content
      use_filename: !opts.publicId,
      unique_filename: !opts.publicId,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (err) {
    console.warn("[cloudinary] upload failed, falling back to source URL:", err);
    return sourceUrl;
  }
}
