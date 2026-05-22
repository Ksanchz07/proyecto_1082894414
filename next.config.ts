import type { NextConfig } from "next";

// Vercel production deployment configuration
const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ['bcryptjs', 'postgres', 'pg'],
};

export default nextConfig;
