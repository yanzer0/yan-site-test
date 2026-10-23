import type { Metadata } from "next";
import { SegundoCerebroEs } from "@/components/segundo-cerebro-es";

const title = "Kit Segundo Cerebro - Memoria para Claude Code | INFUSER";
const description =
  "Configura la memoria de tu Claude Code con Obsidian. Guarda tu contexto, proyectos y decisiones para dejar de explicarlo todo en cada conversación. Por Yan Galasso.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://useinfuser.com/es/kit-segundo-cerebro",
    siteName: "INFUSER",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="relative">
      <SegundoCerebroEs />
    </div>
  );
}
