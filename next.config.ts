import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Prevenir ciclos de CSS remoto en Vercel
  serverExternalPackages: ['bcryptjs', 'postgres', 'tailwindcss', '@tailwindcss/postcss'],
};

export default nextConfig;
