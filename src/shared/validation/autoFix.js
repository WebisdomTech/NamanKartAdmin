/**
 * Auto-Fix Suggestion Engine
 * Provides single-click auto-fix proposals for common input mistakes.
 */
export function getAutoFixProposal(field, value, rule) {
  if (value === undefined || value === null) return null;

  switch (field) {
    case "slug":
    case "categorySlug": {
      if (typeof value === "string") {
        const fixed = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-+|-+$/g, "");
        if (fixed && fixed !== value) return fixed;
      }
      break;
    }
    case "sku":
    case "couponCode":
    case "code": {
      if (typeof value === "string") {
        const fixed = value.toUpperCase().trim().replace(/\s+/g, "-");
        if (fixed && fixed !== value) return fixed;
      }
      break;
    }
    case "hsnCode": {
      if (typeof value === "string") {
        const fixed = value.replace(/[^0-9]/g, "");
        if (fixed && fixed !== value) return fixed;
      }
      break;
    }
    case "basePrice":
    case "salePrice":
    case "costPrice": {
      if (typeof value === "number" && !isNaN(value)) {
        const fixed = Math.round(value * 100) / 100;
        if (fixed !== value && fixed >= 0) return fixed;
      } else if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (!isNaN(parsed) && parsed >= 0) return Math.round(parsed * 100) / 100;
      }
      break;
    }
    case "phone": {
      if (typeof value === "string") {
        const digits = value.replace(/[^0-9]/g, "");
        if (digits.length === 10 && digits !== value) return digits;
      }
      break;
    }
    case "pincode": {
      if (typeof value === "string") {
        const digits = value.replace(/[^0-9]/g, "");
        if (digits.length === 6 && digits !== value) return digits;
      }
      break;
    }
    default:
      break;
  }

  return null;
}
