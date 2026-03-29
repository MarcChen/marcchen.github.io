import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Trailing slashes for GitHub Pages compatibility
  trailingSlash: true,
  // Base path for PR previews via GitHub Actions
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
