import type { Metadata } from "next";
import { Outfit, Space_Mono, Fraunces } from "next/font/google";
import localFont from "next/font/local";
import { UtmTracker } from "@/components/utm-tracker";
import { MetaPixel } from "@/components/meta-pixel";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fraunces = Fraunces({
  variable: "--font-punch",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
});

const cabinetGrotesk = localFont({
  variable: "--font-cabinet",
  src: [
    { path: "../fonts/cabinet-grotesk-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/cabinet-grotesk-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cabinet-grotesk-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/cabinet-grotesk-800.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Infuser — Kits de Automação e Produtividade",
  description:
    "Kits prontos pra transformar sua rotina. Jarvis Kit (automação por palmas e voz) e Segundo Cérebro. Por Yan Galasso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${spaceMono.variable} ${fraunces.variable} ${cabinetGrotesk.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <UtmTracker />
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
