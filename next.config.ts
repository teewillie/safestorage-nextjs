import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    delete config.resolve.alias.pdfjs;
    return config;
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-dialog']
  },
  images: {
    remotePatterns: [
      {
        hostname: 'lnelahckmdnrrdlsjohp.supabase.co',
        protocol: 'https',
        port: '',
      },
    ],
  },
  // Add CORS headers for document preview
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
