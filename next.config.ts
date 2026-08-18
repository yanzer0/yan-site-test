import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  productionBrowserSourceMaps: false,
  async redirects() {
    return [
      { source: "/legiaodeagentes", destination: "/legiao", permanent: false },
      // URL que o Yan usa pra se referir a pagina; a canonica (e a dos anuncios)
      // segue sendo /kit-segundo-cerebro.
      { source: "/segundo-cerebro", destination: "/kit-segundo-cerebro", permanent: false },
    ];
  },
  async rewrites() {
    return [
      // O Escritorio continua sendo servido pelo Mission Control, mas o
      // visitante o acessa pelo dominio principal. As chamadas internas da
      // pagina usam a observabilidade e os documentos do tenant Infuser; por
      // isso as duas superficies autenticadas precisam do mesmo proxy limitado.
      {
        source: "/time",
        destination: "https://mcp.useinfuser.com/mc?view=agents",
        basePath: false,
      },
      {
        source: "/admin/api/aos/:path*",
        destination: "https://mcp.useinfuser.com/admin/api/aos/:path*",
        basePath: false,
      },
      {
        source: "/admin/api/tenants/:path*",
        destination: "https://mcp.useinfuser.com/admin/api/tenants/:path*",
        basePath: false,
      },
      // Guia "IA sem bajulacao" (isca do carrossel do @yangalasso, entregue no
      // direct via ManyChat). E um HTML estatico self-contained em public/, o
      // rewrite so tira o .html da URL que o lead ve.
      {
        source: "/guia-ia-sem-bajulacao",
        destination: "/guia-ia-sem-bajulacao.html",
      },
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
        // Artes da pagina do Segundo Cerebro MCP. Mesmo raciocinio do /club:
        // nao sao content-hashed, entao trocar arte = trocar o nome do arquivo.
        source: "/segundo-cerebro-mcp/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Assets estaticos SOB /legiao (fonts woff2 + avatares webp). :path+ exige
        // >=1 segmento, entao casa /legiao/fonts/x e /legiao/avatars/x mas NAO a
        // pagina /legiao em si — o HTML da LP muda e NAO pode pegar immutable de 1 ano
        // (senao visitante recorrente/CDN serve versao velha). Nome novo ao trocar
        // asset = cache novo, mesmo raciocinio do /club.
        source: "/legiao/:path+",
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
