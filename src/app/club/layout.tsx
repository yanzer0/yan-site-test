import type { PropsWithChildren } from "react";
import { ClubUtmifyPixel } from "@/components/club-utmify-pixel";
import { ClubClarity } from "@/components/club-clarity";

export default function ClubLayout({ children }: PropsWithChildren) {
  return (
    <>
      <ClubUtmifyPixel />
      <ClubClarity />
      {children}
    </>
  );
}
