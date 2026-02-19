import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Enable standalone output for Docker
  output: "standalone",

  // Transpile packages from monorepo
  transpilePackages: ["@marketplace/ui", "@marketplace/types"],

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    NEXT_PUBLIC_S3_BASE_URL:
      process.env.S3_BASE_URL || "https://s3.lyrocs.ovh/marketplace",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.lyrocs.ovh",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
