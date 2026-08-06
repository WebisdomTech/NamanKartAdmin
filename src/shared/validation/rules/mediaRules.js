import { VALIDATION_CODES } from "../codes.js";
import { SEVERITY } from "../severity.js";

export const mediaRules = {
  images: {
    field: "images",
    label: "Product Images",
    required: false,
    minCount: 1,
    severity: SEVERITY.ERROR,
    code: VALIDATION_CODES.REQUIRED_PRIMARY_IMAGE_MISSING,
    message: "Published products require at least one high-quality product image.",
    helperText: "Upload main showcase images for product page.",
  },
  minWidth: 500,
  minHeight: 500,
  maxSizeBytes: 5 * 1024 * 1024, // 5 MB
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
};
