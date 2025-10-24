import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
    unoptimized: true // This allows data URLs to work properly
  },
};

export default nextConfig;
