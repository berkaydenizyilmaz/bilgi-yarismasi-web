// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning seviyesindeki hataları görmezden gel
    ignoreDuringBuilds: true
  },
  typescript: {
    // Type check hatalarını görmezden gel
    ignoreBuildErrors: true
  }
};

export default nextConfig;