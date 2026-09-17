import { storageConfig } from "../config/storage.js";

// Wraps whatever provider is configured (S3 / Cloudinary) so controllers
// don't need to know which one is in use.

/**
 * Upload a file buffer, return the public URL.
 */
export async function uploadFile(buffer, filename, contentType = "image/png") {
  // TODO: implement actual upload using storageConfig.provider
  // e.g. S3 PutObjectCommand or cloudinary.uploader.upload_stream
  throw new Error("uploadFile not implemented yet");
}

/**
 * Resolve a stored key/id to a public URL, if the provider needs that.
 */
export function getFileUrl(key) {
  // TODO: implement based on provider
  return `https://placeholder.example.com/${key}`;
}
