import { VALIDATION_CODES } from "../codes.js";
import { SEVERITY } from "../severity.js";

export const seoRules = {
  metaTitle: {
    field: "metaTitle",
    label: "Meta Title",
    required: false,
    maxLength: 60,
    severity: SEVERITY.WARNING,
    code: VALIDATION_CODES.SEO_META_TITLE_LONG,
    message: "Meta Title exceeds 60 characters and may be truncated in search results.",
    example: "Buy Sacred Vrindavan Tulsi Mala 108 Beads — NamanKart",
    helperText: "Optimal length: 50-60 characters.",
  },
  metaDescription: {
    field: "metaDescription",
    label: "Meta Description",
    required: false,
    maxLength: 160,
    severity: SEVERITY.WARNING,
    code: VALIDATION_CODES.SEO_META_DESC_LONG,
    message: "Meta Description exceeds 160 characters and may be cut off on Google.",
    example: "100% authentic handcrafted Tulsi kanthi mala from Vrindavan. Free shipping above ₹999.",
    helperText: "Optimal length: 140-160 characters.",
  },
  focusKeyword: {
    field: "focusKeyword",
    label: "Focus Keyword",
    required: false,
    maxLength: 50,
    severity: SEVERITY.INFO,
    code: VALIDATION_CODES.FIELD_TOO_LONG,
    message: "Focus keyword should be concise (1-3 words).",
    example: "tulsi kanthi mala",
    helperText: "Target keyword for SEO optimization.",
  },
  canonical: {
    field: "canonical",
    label: "Canonical URL",
    required: false,
    pattern: /^(https?:\/\/[^\s]+)?$/,
    severity: SEVERITY.WARNING,
    code: VALIDATION_CODES.INVALID_URL,
    message: "Canonical URL must be a valid full URL starting with http:// or https://",
    example: "https://namankart.com/product/tulsi-kanthi-mala",
  },
};
