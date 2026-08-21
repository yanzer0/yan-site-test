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
      // /time = Infuser SkillTree (decisao Yan 21/08/2026). Antes daqui saia o
      // Mission Control (?view=agents); o MC inteiro vive agora so em
      // mcp.useinfuser.com/mc, e por isso os proxies de /admin/api sairam: nao
      // ha mais superficie autenticada do MC neste dominio.
      //
      // O SkillTree e servido por um container proprio na VPS, pendurado em
      // mcp.useinfuser.com/st (Caddy remove o prefixo). Os caminhos abaixo sao
      // EXATAMENTE os que a pagina pede -- listados um a um de proposito, pra
      // nao virar proxy aberto pra dentro da rede.
      {
        source: "/time",
        destination: "https://mcp.useinfuser.com/st/skilltree",
        basePath: false,
      },
      ...[
        "skilltree.css",
        "skilltree.js",
        "skilltree-auth.js",
        "skilltree-model.js",
        "skilltree-route.js",
        "skilltree-standalone.css",
        "skilltree-standalone.js",
      ].map((file) => ({
        source: `/${file}`,
        destination: `https://mcp.useinfuser.com/st/${file}`,
        basePath: false as const,
      })),
      {
        // :path* e nao :file -- os 33 retratos moram em agent-portraits/, ou seja, mais de um
        // segmento. Com :file eles davam 404. O upstream e uma allowlist explicita, entao o
        // curinga aqui nao vira proxy aberto: so os arquivos que o container declara existem.
        source: "/skilltree-assets/:path*",
        destination: "https://mcp.useinfuser.com/st/skilltree-assets/:path*",
        basePath: false,
      },
      // Dado do SkillTree, as duas portas que a tela consome. Exigem token: o
      // container devolve 401 sem ele, entao estes proxies nao expoem nada por si
      // so. O gate la e por prefixo /api/, entao rota nova nasce fechada.
      ...["agentes", "organization"].map((recurso) => ({
        source: `/api/${recurso}`,
        destination: `https://mcp.useinfuser.com/st/api/${recurso}`,
        basePath: false as const,
      })),
      // Guia "IA sem bajulacao" (isca do carrossel do @yangalasso, entregue no
      // direct via ManyChat). E um HTML estatico self-contained em public/, o
      // rewrite so tira o .html da URL que o lead ve.
      {
        source: "/guia-ia-sem-bajulacao",
        destination: "/guia-ia-sem-bajulacao.html",
      },
      // Demo navegavel do Marja App, enviada junto da proposta (prospect Marja
      // Ortopedia, 21/08/2026). Mesmo padrao dos guias: HTML self-contained em
      // public/, o rewrite so tira o .html da URL. A diferenca e que esta rota
      // exige senha -- ver src/middleware.ts, que cobre /demomarja E o .html.
      {
        source: "/demomarja",
        destination: "/demomarja.html",
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
