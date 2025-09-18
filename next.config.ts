/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ignore ESLint errors during next build
  },
  typescript: {
    ignoreBuildErrors: true, // ignore TS errors during build
  },
};

module.exports = nextConfig;
