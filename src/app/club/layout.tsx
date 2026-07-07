import type { PropsWithChildren } from "react";
import { Inter, Onest, Fraunces, Geist_Mono } from "next/font/google";
import { ClubUtmifyPixel } from "@/components/club-utmify-pixel";
import { ClubClarity } from "@/components/club-clarity";

// Fontes da identidade v2 do Club self-hosted (perf: sem Google Fonts CDN).
// Cada uma expõe uma CSS var consumida em .club-scope no club-live.html.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  display: "swap",
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function ClubLayout({ children }: PropsWithChildren) {
  return (
    <div
      className={`club-scope ${inter.variable} ${onest.variable} ${fraunces.variable} ${geistMono.variable}`}
    >
      <ClubUtmifyPixel />
      <ClubClarity />
      {children}
    </div>
  );
}
