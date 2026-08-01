import type { PropsWithChildren } from "react";
import { SegundoCerebroUtmifyPixel } from "@/components/segundo-cerebro-utmify-pixel";

export default function KitSegundoCerebroLayout({ children }: PropsWithChildren) {
  return (
    <>
      <SegundoCerebroUtmifyPixel />
      {children}
    </>
  );
}
