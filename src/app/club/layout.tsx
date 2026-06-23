import type { PropsWithChildren } from "react";
import { UtmifyPixel } from "@/components/utmify-pixel";

export default function ClubLayout({ children }: PropsWithChildren) {
  return (
    <>
      <UtmifyPixel />
      {children}
    </>
  );
}
