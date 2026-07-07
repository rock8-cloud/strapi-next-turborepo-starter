import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server in .next/standalone — used by the
  // Dockerfile to build a small runtime image.
  output: "standalone",
  // Pin the monorepo root so workspace detection (file tracing, Turbopack)
  // doesn't depend on stray lockfiles outside the repo.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
