import type { Metadata } from "next";
import { PremiumUpsellEn } from "@/components/premium-upsell-en";

export const metadata: Metadata = {
  title: "Second Brain Premium | INFUSER",
  description: "Upgrade your Second Brain Kit with automatic upkeep for your saved notes, tasks and lessons.",
  robots: { index: false },
};

export default function Page() {
  return <PremiumUpsellEn />;
}
