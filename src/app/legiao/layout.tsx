import type { PropsWithChildren } from "react";
import { UtmifyPixel } from "@/components/utmify-pixel";

// Espelha o club/layout.tsx: pixel Utmify na rota da pagina de vendas.
export default function LegiaoLayout({ children }: PropsWithChildren) {
  return (
    <>
      <UtmifyPixel />
      {children}
    </>
  );
}
