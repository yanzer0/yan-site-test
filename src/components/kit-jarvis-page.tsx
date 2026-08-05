"use client";

import { Hero } from "@/components/hero";
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
      <div className="fixed inset-0 z-0 pointer-events-none bg-black" />
      <div className="relative z-10">
        <main>
          <Hero />
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
