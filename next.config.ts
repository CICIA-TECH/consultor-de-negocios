import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf.js resuelve internamente su worker y sus fuentes estándar con paths
  // relativos a sus propios archivos en node_modules (ver
  // lib/documents/parse.ts) — eso se rompe si Next.js lo empaqueta dentro
  // de la API route. Al marcarlo como externo, corre "tal cual" desde
  // node_modules, igual que en Node puro.
  serverExternalPackages: ["pdfjs-dist"],
  // Aun así, Vercel necesita que le digamos explícitamente que incluya esos
  // archivos (worker + fuentes) en el bundle de la función serverless.
  outputFileTracingIncludes: {
    "/api/documents/parse": [
      "./node_modules/pdfjs-dist/standard_fonts/**",
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ],
  },
};

export default nextConfig;
