import type { Metadata } from "next";
import { KitSkillsPage } from "@/components/kit-skills-page";

export const metadata: Metadata = {
  title: "Pack de Skills pro Claude Code — 10 Skills Premium | INFUSER",
  description:
    "10 skills curadas entre 69.000+ disponíveis pra transformar o Claude Code num time inteiro — designer, copywriter, auditor de SEO, testador e mais. Instale em 5 minutos.",
};

export default function Page() {
  return <KitSkillsPage />;
}
