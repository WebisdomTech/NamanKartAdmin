import { categoryRules } from "../rules/categoryRules.js";
import { seoRules } from "../rules/seoRules.js";

export const categoryPublishProfile = {
  name: "CategoryPublish",
  strictMode: true,
  rules: {
    name: categoryRules.name,
    slug: categoryRules.slug,
    description: categoryRules.description,
    h1: categoryRules.h1,
    metaTitle: seoRules.metaTitle,
    metaDescription: seoRules.metaDescription,
  },
};
