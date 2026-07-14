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
        // Assets estaticos do Club (webp/mp4/svg em public/club). Nao sao
        // content-hashed, mas o fluxo de atualizacao RENOMEIA o arquivo ao
        // trocar (ex: prova-2.jpg -> prova-2.png -> prova-2.webp), entao
        // immutable/1 ano e seguro (URL nova = cache novo) e da credito total
        // no "efficient cache policy" do PageSpeed. Se um dia precisar
        // substituir mantendo o mesmo nome, trocar o nome/versionar a URL.
        source: "/club/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Avatares dos agentes em /legiao (webp estatico, ver public/legiao/avatars).
        // Mesmo raciocinio do /club: nome novo ao trocar imagem = cache novo.
        source: "/legiao/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
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
