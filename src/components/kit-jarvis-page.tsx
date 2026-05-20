"use client";

import { FallingPattern } from "@/components/ui/falling-pattern-lazy";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { TrustBar } from "@/components/trust-bar";
import { Problem } from "@/components/services";
import { AITeacher } from "@/components/stats";
import { Technical } from "@/components/technical";
import { FAQ } from "@/components/faq";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { Offer } from "@/components/offer";
import {
  Testimonials,
  type Testimonial,
  type FeaturedVideo,
} from "@/components/testimonials";

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Isabela",
    screenshot: "/testimonial-isabela.webp",
    screenshotAspect: "portrait",
  },
  {
    name: "Comprador verificado",
    screenshot: "/testimonial-brother.webp",
    screenshotAspect: "square",
  },
  {
    name: "Pedro",
    screenshot: "/testimonial-pedro.webp",
    screenshotAspect: "portrait",
  },
];

const TESTIMONIAL_VIDEO: FeaturedVideo = {
  src: "/video-testimonial-jarvis.mp4",
  poster: "/video-testimonial-jarvis-poster.webp",
  alt: "Vídeo de cliente usando o JARVIS Kit",
};

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
        {/* Dark overlay to dim the pattern uniformly */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <TrustBar />
          <Problem />
          <AITeacher />
          <Testimonials items={TESTIMONIALS} video={TESTIMONIAL_VIDEO} />
          <Offer />
          <Technical />
          <CTA />
          <FAQ />
        </main>
        <Footer />
      </div>
    </>
  );
}
