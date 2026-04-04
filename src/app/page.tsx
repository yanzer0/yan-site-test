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

export default function Home() {
  return (
    <>
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
      </main>
      <Footer />
    </>
  );
}
