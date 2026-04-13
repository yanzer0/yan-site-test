import type { Metadata } from "next";
import { KitSegundoCerebroPage } from "@/components/kit-segundo-cerebro-page";

export const metadata: Metadata = {
  title: "Kit Segundo Cérebro — Memória Permanente pro Claude Code | INFUSER",
  description:
    "Dê memória permanente pro seu Claude Code. Ele lembra quem você é, o que faz, e o que precisa — sem explicar de novo. Por Yan Galasso.",
};

export default function Page() {
  return <KitSegundoCerebroPage />;
}
