/**
 * Smart Slug Suggestion Generator
 * Produces 3 contextual alternative slug suggestions when a slug collision occurs.
 */
export function generateSmartSlugs(baseSlug, context = {}) {
  const clean = (baseSlug || "product")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suggestions = [
    `${clean}-2`,
    `${clean}-india`,
    `${clean}-original`,
  ];

  if (context.categorySlug) {
    const catClean = context.categorySlug.toLowerCase().replace(/[^a-z0-9-]+/g, "");
    if (!suggestions.includes(`${clean}-${catClean}`)) {
      suggestions[1] = `${clean}-${catClean}`;
    }
  }

  if (context.brand) {
    const brandClean = context.brand.toLowerCase().replace(/[^a-z0-9-]+/g, "");
    if (brandClean && !suggestions.includes(`${brandClean}-${clean}`)) {
      suggestions[2] = `${brandClean}-${clean}`;
    }
  }

  return Array.from(new Set(suggestions)).slice(0, 3);
}
