import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // TypeScript errors are now fixed, no need to ignore
  // ESLint passes, no need to ignore
  serverExternalPackages: ['pdf-parse'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
