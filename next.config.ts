import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  productionBrowserSourceMaps: false,
  async redirects() {
    return [
      { source: "/legiaodeagentes", destination: "/legiao", permanent: false },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1400],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
