import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ['bcryptjs', 'postgres', 'pg'],
};

export default nextConfig;
