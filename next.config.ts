import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf.js necesita sus fuentes estándar en runtime (ver lib/documents/parse.ts);
  // sin esto, Vercel no las incluye en el bundle de la función serverless.
  outputFileTracingIncludes: {
    "/api/documents/parse": [
      "./node_modules/pdfjs-dist/standard_fonts/**",
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ],
  },
};

export default nextConfig;
