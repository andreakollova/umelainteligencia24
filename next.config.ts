import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'actu.epfl.ch' },
      { protocol: 'https', hostname: 'www.media.mit.edu' },
      { protocol: 'https', hostname: 'www.eurekalert.org' },
    ],
  },
  serverExternalPackages: ['sharp'],
  outputFileTracingIncludes: {
    '/api/ig-publish': ['./scraper/**/*', './scraper/fonts/**/*'],
  },
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
