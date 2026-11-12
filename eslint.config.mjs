import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // React Three Fiber mutates three.js objects (materials, uniforms, refs) inside useFrame by design;
  // the React Compiler purity rules do not model that imperative render loop.
  {
    files: ["components/city/**/*.{ts,tsx}"],
    rules: { "react-hooks/immutability": "off", "react-hooks/refs": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Archived Build 1 (kept for reference, not part of the app)
    "design/**",
  ]),
]);

export default eslintConfig;
