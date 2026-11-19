import type { Metadata } from "next";
import { HomeV2 } from "@/components/home/home-v2";
import "./home-v2.css";

export const metadata: Metadata = {
  title: "Infuser | IA aplicada à rotina e à operação",
  description:
    "A Infuser monta segundos cérebros, agentes e automações para empresas e vende os kits que usa aqui dentro: Kit Segundo Cérebro, A Legião, Estúdio de CrIAção, Kit de Skills e JARVIS Kit. Central de guias gratuita.",
};

export default function Home() {
  return <HomeV2 />;
}
