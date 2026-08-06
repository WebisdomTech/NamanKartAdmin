import { getAutoFixProposal } from "./autoFix.js";
import { generateSmartSlugs } from "./smartSlug.js";
import { SEVERITY } from "./severity.js";
import { VALIDATION_CODES } from "./codes.js";

/**
 * 5-STEP ENTERPRISE VALIDATION PIPELINE
 * Execution flow:
 *   1. Normalize
 *   2. AutoFix Propose
 *   3. Profile Rule Execution
 *   4. Cross-Field Logic
 *   5. Entity Dependency Logic (async)
 */
export async function runValidationPipeline(data, profile, options = {}) {
  const errors = [];
  const warnings = [];
  const info = [];
  const autoFixes = {};
  const normalizedData = { ...data };

  // STEP 1: NORMALIZE
  for (const [key, val] of Object.entries(normalizedData)) {
    if (typeof val === "string") {
      normalizedData[key] = val.trim();
    }
  }

  // STEP 2 & 3: AUTO-FIX & PROFILE RULES EXECUTION
  const rules = profile.rules || {};
  for (const [fieldKey, rule] of Object.entries(rules)) {
    const val = normalizedData[fieldKey];

    // Auto-fix proposal check
    const fixProposal = getAutoFixProposal(fieldKey, val, rule);
    if (fixProposal !== null) {
      autoFixes[fieldKey] = fixProposal;
    }

    // Required check
    if (rule.required) {
      const isMissing =
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0);
      if (isMissing) {
        const errObj = {
          field: rule.field || fieldKey,
          code: rule.code || VALIDATION_CODES.REQUIRED_FIELD,
          severity: rule.severity || SEVERITY.ERROR,
          value: val,
          expected: `Required field (${rule.label || fieldKey})`,
          message: `${rule.label || fieldKey} is required.`,
          example: rule.example || "",
        };
        if (errObj.severity === SEVERITY.ERROR) errors.push(errObj);
        else if (errObj.severity === SEVERITY.WARNING) warnings.push(errObj);
        else info.push(errObj);
        continue;
      }
    }

    // Skip further checks on empty optional values
    if (val === undefined || val === null || val === "") continue;

    // Type / MinLength / MaxLength / Pattern checks
    if (typeof val === "string") {
      if (rule.minLength && val.length < rule.minLength) {
        const issue = {
          field: rule.field || fieldKey,
          code: VALIDATION_CODES.FIELD_TOO_SHORT,
          severity: rule.severity || SEVERITY.ERROR,
          value: val,
          expected: `Minimum ${rule.minLength} characters`,
          message: rule.message || `${rule.label} must be at least ${rule.minLength} characters.`,
          example: rule.example || "",
        };
        if (issue.severity === SEVERITY.ERROR) errors.push(issue);
        else warnings.push(issue);
      }
      if (rule.maxLength && val.length > rule.maxLength) {
        const issue = {
          field: rule.field || fieldKey,
          code: rule.code || VALIDATION_CODES.FIELD_TOO_LONG,
          severity: rule.severity || SEVERITY.WARNING,
          value: val,
          expected: `Maximum ${rule.maxLength} characters`,
          message: rule.message || `${rule.label} exceeds ${rule.maxLength} characters limit.`,
          example: rule.example || "",
        };
        if (issue.severity === SEVERITY.ERROR) errors.push(issue);
        else warnings.push(issue);
      }
      if (rule.pattern && !rule.pattern.test(val)) {
        const issue = {
          field: rule.field || fieldKey,
          code: rule.code || VALIDATION_CODES.INVALID_SLUG,
          severity: rule.severity || SEVERITY.ERROR,
          value: val,
          expected: `Valid format matching pattern`,
          message: rule.message || `${rule.label} has an invalid format.`,
          example: rule.example || "",
          autoFix: autoFixes[fieldKey] || null,
        };
        if (issue.severity === SEVERITY.ERROR) errors.push(issue);
        else warnings.push(issue);
      }
    }

    if (typeof val === "number" || (!isNaN(val) && typeof val !== "boolean")) {
      const numVal = Number(val);
      if (rule.min !== undefined && numVal < rule.min) {
        errors.push({
          field: rule.field || fieldKey,
          code: rule.code || VALIDATION_CODES.INVALID_PRICE,
          severity: SEVERITY.ERROR,
          value: val,
          expected: `Minimum value of ${rule.min}`,
          message: rule.message || `${rule.label} must be at least ${rule.min}.`,
          example: rule.example || "",
        });
      }
      if (rule.max !== undefined && numVal > rule.max) {
        errors.push({
          field: rule.field || fieldKey,
          code: rule.code || VALIDATION_CODES.INVALID_GST,
          severity: SEVERITY.ERROR,
          value: val,
          expected: `Maximum value of ${rule.max}`,
          message: rule.message || `${rule.label} cannot exceed ${rule.max}.`,
          example: rule.example || "",
        });
      }
      if (rule.integerOnly && !Number.isInteger(numVal)) {
        errors.push({
          field: rule.field || fieldKey,
          code: VALIDATION_CODES.INVALID_STOCK,
          severity: SEVERITY.ERROR,
          value: val,
          expected: `Integer number`,
          message: `${rule.label} must be a whole number.`,
          example: rule.example || "",
        });
      }
    }
  }

  // STEP 4: CROSS-FIELD VALIDATION
  if (normalizedData.basePrice !== undefined && normalizedData.salePrice !== undefined) {
    const base = Number(normalizedData.basePrice);
    const sale = Number(normalizedData.salePrice);
    if (!isNaN(base) && !isNaN(sale) && sale > base) {
      errors.push({
        field: "salePrice",
        code: VALIDATION_CODES.SALE_EXCEEDS_BASE,
        severity: SEVERITY.ERROR,
        value: sale,
        expected: `Sale Price (₹${sale}) ≤ Base Price (₹${base})`,
        message: `Sale Price (₹${sale}) cannot be higher than Base Price (₹${base}).`,
        example: `Set salePrice to ₹${base}`,
        autoFix: base,
      });
    }
  }

  if (normalizedData.type === "percentage" && normalizedData.value !== undefined) {
    const pct = Number(normalizedData.value);
    if (!isNaN(pct) && pct > 100) {
      errors.push({
        field: "value",
        code: VALIDATION_CODES.COUPON_PERCENTAGE_EXCEEDS,
        severity: SEVERITY.ERROR,
        value: pct,
        expected: `Percentage discount ≤ 100%`,
        message: `Percentage discount value (${pct}%) cannot exceed 100%.`,
        example: "10",
        autoFix: 100,
      });
    }
  }

  if (normalizedData.expiresAt) {
    const expDate = new Date(normalizedData.expiresAt);
    if (isNaN(expDate.getTime()) || expDate <= new Date()) {
      errors.push({
        field: "expiresAt",
        code: VALIDATION_CODES.EXPIRED_DATE,
        severity: SEVERITY.ERROR,
        value: normalizedData.expiresAt,
        expected: `Future date`,
        message: `Coupon expiration date must be in the future.`,
        example: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
      });
    }
  }

  // STEP 5: ENTITY DEPENDENCY VALIDATION (Optional async checks passed in options)
  if (options.checkSlugUnique && typeof options.checkSlugUnique === "function") {
    if (normalizedData.slug) {
      const uniqueRes = await options.checkSlugUnique(normalizedData.slug, options.excludeId);
      if (!uniqueRes.available) {
        const suggestions = generateSmartSlugs(normalizedData.slug, normalizedData);
        errors.push({
          field: "slug",
          code: VALIDATION_CODES.DUPLICATE_SLUG,
          severity: SEVERITY.ERROR,
          value: normalizedData.slug,
          expected: "Unique lowercase slug",
          message: `Slug '${normalizedData.slug}' already exists in database.`,
          example: suggestions[0],
          suggestions,
        });
      }
    }
  }

  if (options.checkSkuUnique && typeof options.checkSkuUnique === "function") {
    if (normalizedData.sku) {
      const skuRes = await options.checkSkuUnique(normalizedData.sku, options.excludeId);
      if (!skuRes.available) {
        errors.push({
          field: "sku",
          code: VALIDATION_CODES.DUPLICATE_SKU,
          severity: SEVERITY.ERROR,
          value: normalizedData.sku,
          expected: "Unique SKU",
          message: `SKU '${normalizedData.sku}' is already assigned to another product.`,
          example: `${normalizedData.sku}-NEW`,
        });
      }
    }
  }

  const isValid = errors.length === 0;

  return {
    valid: isValid,
    profile: profile.name,
    errors,
    warnings,
    info,
    autoFixes,
    normalizedData,
  };
}
