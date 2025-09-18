import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:2010/api/:path*",
      },
    ];
  },
  images: {
    domains: ["cdn.cloudflare.steamstatic.com"], // allow game icon UsssRLs
  },
};

module.exports = {
  output: "export",
};

export default nextConfig;
