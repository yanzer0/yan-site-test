import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // Sem isto o esbuild compila JSX para `React.createElement` e o teste quebra
  // com "React is not defined": o Next usa o runtime automático, e o vitest não
  // herda essa configuração do next.config.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    // .tsx entra para os testes que RENDERIZAM componente. Guard de copy por
    // leitura de arquivo não pega o que só existe montado: qual texto cada
    // faixa recebe de fato, e se as duas recebem o mesmo.
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
