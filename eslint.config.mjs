import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Pre-existing `any` usage across the codebase predates this config;
      // downgraded to a warning so it's visible without blocking builds.
      // Tighten back to "error" once those call sites are properly typed.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
