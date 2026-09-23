// Config for wherever captured strip images / uploaded items live (S3, Cloudinary, etc).
// Keep credentials in env vars — do not hardcode.

export const storageConfig = {
  provider: process.env.STORAGE_PROVIDER || "s3", // "s3" | "cloudinary"
  bucket: process.env.STORAGE_BUCKET,
  region: process.env.STORAGE_REGION,
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  // Cloudinary alt config
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

// TODO: initialize and export the actual SDK client here (e.g. AWS S3Client
// or cloudinary.v2.config(...)) once a provider is chosen.
