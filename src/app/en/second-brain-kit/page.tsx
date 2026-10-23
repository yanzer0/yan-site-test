import type { Metadata } from "next";
import { SegundoCerebroEn } from "@/components/segundo-cerebro-en";

export const metadata: Metadata = {
  title: "Second Brain Kit - Persistent Memory for Claude Code | INFUSER",
  description:
    "Stop repeating your background to Claude Code. Build a Second Brain with persistent memory, ready-to-use commands, and templates for your work. By Yan Galasso.",
  openGraph: {
    title: "Second Brain Kit - Persistent Memory for Claude Code | INFUSER",
    description:
      "Set up persistent memory for Claude Code. Keep your projects, goals, and decisions in context with the Second Brain Kit by Yan Galasso.",
    url: "https://useinfuser.com/en/second-brain-kit",
    siteName: "INFUSER",
    locale: "en_US",
    type: "website",
  },
};

export default function Page() {
  return <SegundoCerebroEn />;
}
