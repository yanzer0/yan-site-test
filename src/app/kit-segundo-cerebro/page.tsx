import { readFileSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";

// A pagina e um HTML self-contained (CSS, fontes e artes embutidas) gerado fora do
// repo. Fica em arquivo, e nao em literal .ts, porque 358 KB dentro do TypeScript
// travam o type-check e ameacam o tempo de build. Lido no build (pagina estatica).
// Fonte editavel: 'Cerebro Infuser/pagina-vendas-mcp.html'.
// O tracking (UtmTracker, Utmify Pixel, Meta Pixel) NAO vive aqui: vem do layout,
// que e o motivo de esta rota continuar sendo uma page e nao um route handler.

export const metadata: Metadata = {
  title: "Segundo Cérebro Infuser — MCP para Claude e Codex | INFUSER",
  description:
    "Conecte um cérebro privado ao Claude ou Codex. Ele guarda seus projetos, decisões e ideias para a próxima conversa começar de onde o seu trabalho parou. Por Yan Galasso.",
};

export default function Page() {
  const html = readFileSync(
    join(process.cwd(), "src", "app", "kit-segundo-cerebro", "pagina.html"),
    "utf-8"
  );

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
