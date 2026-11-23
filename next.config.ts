import type { NextConfig } from "next";

// Security headers for every route. HSTS is added by Vercel. The CSP is deliberately narrow: it
// blocks framing (clickjacking), plugins, <base> hijacking and off-site form posts, but leaves
// scripts and styles alone (the inline theme script and JSON-LD would need nonces otherwise).
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: { formats: ["image/avif", "image/webp"] },
  // Fewer build workers: with 11 (one per core) builds ran out of memory on a busy dev machine.
  // Remove to build faster on a machine with more free memory (or in CI).
  experimental: { cpus: 2 },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
