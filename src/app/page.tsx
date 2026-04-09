"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { TrustBar } from "@/components/trust-bar";
import { Problem } from "@/components/services";
import { Includes } from "@/components/how-it-works";
import { AITeacher } from "@/components/stats";
import { Technical } from "@/components/technical";
import { FAQ } from "@/components/faq";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { ProductSelector } from "@/components/product-selector";
import { SegundoCerebro } from "@/components/segundo-cerebro";
import { SegundoCerebroUpsell } from "@/components/upsell-segundo-cerebro";

type Kit = "jarvis" | "segundo-cerebro" | null;

export default function Home() {
  const [selectedKit, setSelectedKit] = useState<Kit>(null);

  function handleSelect(kit: "jarvis" | "segundo-cerebro") {
    setSelectedKit(kit);
  }

  function handleBack() {
    setSelectedKit(null);
  }

  // Scroll to top on kit change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedKit]);

  // Product selector screen
  if (selectedKit === null) {
    return <ProductSelector onSelect={handleSelect} />;
  }

  // Segundo Cerebro placeholder
  if (selectedKit === "segundo-cerebro") {
    return <SegundoCerebro onBack={handleBack} onNavigateToJarvis={() => setSelectedKit("jarvis")} />;
  }

  // Jarvis Kit — original landing page, untouched
  return (
    <>
      <Navbar onBack={handleBack} />
      <main>
        <Hero />
        <TrustBar />
        <Problem />
        <Includes />
        <AITeacher />
        <Technical />
        <FAQ />
        <CTA />
        <SegundoCerebroUpsell onNavigate={() => setSelectedKit("segundo-cerebro")} />
      </main>
      <Footer />
    </>
  );
}
