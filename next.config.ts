import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  productionBrowserSourceMaps: false,
  async redirects() {
    return [
      { source: "/legiaodeagentes", destination: "/legiao", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        // arquivos estaticos do Club (webp/mp4 em public/club) nao sao
        // content-hashed, entao usa max-age moderado + stale-while-revalidate
        // em vez de immutable/1 ano (evita servir versao velha por muito
        // tempo quando um asset e substituido com o mesmo nome).
        source: "/club/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1400],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
