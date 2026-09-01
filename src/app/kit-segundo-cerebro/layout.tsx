import type { PropsWithChildren } from "react";
import { SegundoCerebroGtm } from "@/components/segundo-cerebro-gtm";
import { SegundoCerebroUtmifyPixel } from "@/components/segundo-cerebro-utmify-pixel";

export default function KitSegundoCerebroLayout({ children }: PropsWithChildren) {
  return (
    <>
      <SegundoCerebroGtm />
      <SegundoCerebroUtmifyPixel />
      {children}
    </>
  );
}
