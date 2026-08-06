import { productRules } from "../rules/productRules.js";
import { seoRules } from "../rules/seoRules.js";
import { mediaRules } from "../rules/mediaRules.js";

/**
 * ProductPublish Profile:
 * Strict enterprise validation profile for published products on NamanKart store.
 */
export const productPublishProfile = {
  name: "ProductPublished",
  strictMode: true,
  rules: {
    name: productRules.name,
    slug: productRules.slug,
    category: productRules.category,
    categorySlug: productRules.categorySlug,
    basePrice: productRules.basePrice,
    salePrice: productRules.salePrice,
    stock: productRules.stock,
    sku: productRules.sku,
    hsnCode: productRules.hsnCode,
    gstRate: productRules.gstRate,
    shortDescription: productRules.shortDescription,
    images: mediaRules.images,
    metaTitle: seoRules.metaTitle,
    metaDescription: seoRules.metaDescription,
    focusKeyword: seoRules.focusKeyword,
  },
};
