import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1400],
    minimumCacheTTL: 31536000,
  },
  async rewrites() {
    return [
      { source: "/legiaodeagentes", destination: "/legiaodeagentes.html" },
    ];
  },
};

export default nextConfig;
