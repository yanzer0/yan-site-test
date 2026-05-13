import type { PropsWithChildren } from "react";
import { UtmifyPixel } from "@/components/utmify-pixel";

export default function KitJarvisLayout({ children }: PropsWithChildren) {
  return (
    <>
      <UtmifyPixel />
      {children}
    </>
  );
}
