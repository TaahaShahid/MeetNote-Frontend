import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.100.98:3000", "*.local:3000"]
    }
  }
};

export default nextConfig;
