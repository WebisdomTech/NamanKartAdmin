import { productRules } from "../rules/productRules.js";
import { seoRules } from "../rules/seoRules.js";

/**
 * ProductDraft Profile:
 * Allows saving work-in-progress products with minimal fields.
 */
export const productDraftProfile = {
  name: "ProductDraft",
  strictMode: false,
  rules: {
    name: productRules.name,
    slug: { ...productRules.slug, required: false },
    category: { ...productRules.category, required: false },
    categorySlug: { ...productRules.categorySlug, required: false },
    basePrice: { ...productRules.basePrice, required: false },
    sku: productRules.sku,
    hsnCode: productRules.hsnCode,
    gstRate: productRules.gstRate,
  },
};
