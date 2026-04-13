"use client";

import { FallingPattern } from "@/components/ui/falling-pattern";
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
import { SegundoCerebroUpsell } from "@/components/upsell-segundo-cerebro";

export function KitJarvisPage() {
  return (
    <>
      {/* Full-page background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FallingPattern
          className="h-full"
          color="#A8E84C"
          backgroundColor="#000000"
          duration={80}
          blurIntensity="0.5rem"
          density={2}
        />
      </div>
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <TrustBar />
          <Problem />
          <Includes />
          <AITeacher />
          <Technical />
          <FAQ />
          <CTA />
          <SegundoCerebroUpsell />
        </main>
        <Footer />
      </div>
    </>
  );
}
