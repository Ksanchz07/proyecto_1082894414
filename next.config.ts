import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    // Forzar HTTPS en producción durante 1 año (Vercel ya entrega HTTPS por defecto)
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Mitiga clickjacking
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Evita MIME sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Limita exposición de información en el referer
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Bloquea permisos del navegador que la app no usa
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ['bcryptjs', 'postgres', 'pg'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
