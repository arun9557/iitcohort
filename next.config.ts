import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Enable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Add polyfills for node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }
    
    return config;
  },
  
  // Configure images
  images: {
    domains: ['localhost'],
  },
  
  // Configure static export if needed
  // output: 'export', // Uncomment if you're doing a static export
};

export default nextConfig;
