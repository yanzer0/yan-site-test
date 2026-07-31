import type { PropsWithChildren } from "react";
import Script from "next/script";
import { SegundoCerebroUtmifyPixel } from "@/components/segundo-cerebro-utmify-pixel";

// Player VTurb (ConverteAI) da VSL do topo. O <vturb-smartplayer> vem dentro do
// HTML da page; script inline dentro de dangerouslySetInnerHTML nao executa, por
// isso o loader do player vive aqui.
const VTURB_PLAYER_SRC =
  "https://scripts.converteai.net/53b78c15-4e25-48b1-ba74-231d36c12bbd/players/6a6bffff301e1513f9c82c32/v4/player.js";

export default function KitSegundoCerebroLayout({ children }: PropsWithChildren) {
  return (
    <>
      <SegundoCerebroUtmifyPixel />
      <Script src={VTURB_PLAYER_SRC} strategy="afterInteractive" />
      {children}
    </>
  );
}
