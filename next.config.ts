import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  },
  async headers() {
    return [
      {
        // Apple Pay domain association file
        source: '/.well-known/apple-developer-merchantid-domain-association.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // Cache for 24 hours
          },
        ],
      },
    ];
  },
};

export default nextConfig;
