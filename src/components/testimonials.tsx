"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export interface Testimonial {
  quote?: string;
  name: string;
  purchasedAt?: string;
  avatar?: string;
  screenshot?: string;
  screenshotAspect?: "portrait" | "square" | "landscape";
}

export interface FeaturedVideo {
  src: string;
  poster: string;
  alt: string;
}

interface TestimonialsProps {
  items: Testimonial[];
  video?: FeaturedVideo;
}

export function Testimonials({ items, video }: TestimonialsProps) {
  const ref = useScrollReveal();

  if (!items.length && !video) return null;

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
            Quem comprou e{" "}
            <span className="font-punch text-gradient-green">fez funcionar.</span>
          </h2>
          <p className="text-center text-zinc-500 text-[15px] mb-12">
            Prints e vídeos de quem instalou.
          </p>

          {video ? <FeaturedVideoPlayer video={video} /> : null}

          {items.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {items.map((t, i) => (
                <TestimonialCard key={`${t.name}-${i}`} t={t} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const aspect =
    t.screenshotAspect === "landscape"
      ? "aspect-video"
      : t.screenshotAspect === "square"
      ? "aspect-square"
      : "aspect-[3/4]";

  return (
    <figure className="glass card-hover p-4 flex flex-col gap-3">
      {t.screenshot ? (
        <div className={`relative w-full ${aspect} rounded-md overflow-hidden border border-white/8 bg-black/40`}>
          <Image
            src={t.screenshot}
            alt={`Depoimento de ${t.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover"
          />
        </div>
      ) : null}

      {t.quote ? (
        <blockquote className="text-[13.5px] text-zinc-300 leading-relaxed">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
      ) : null}
    </figure>
  );
}

function FeaturedVideoPlayer({ video }: { video: FeaturedVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const handlePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    setStarted(true);
    el.muted = false;
    el.play().catch(() => {
      /* user gesture required — ignore */
    });
  };

  return (
    <div className="mb-10 max-w-2xl mx-auto">
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video">
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster}
          aria-label={video.alt}
          controls={started}
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {!started ? (
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Reproduzir vídeo com som"
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors duration-200 cursor-pointer group"
          >
            <span className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-green-500 text-black shadow-[0_0_40px_rgba(168,232,76,0.35)] group-hover:scale-105 transition-transform duration-200">
              <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-current ml-1" />
            </span>
          </button>
        ) : null}
      </div>
      <p className="font-mono text-[11px] text-zinc-500 text-center mt-3">
        Toque pra ouvir com som
      </p>
    </div>
  );
}
