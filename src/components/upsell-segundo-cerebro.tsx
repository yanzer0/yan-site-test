"use client";

import Script from "next/script";

export function SegundoCerebroUpsell() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-8 sm:p-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-5 bg-purple-400/40" />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-purple-400/70">
              Oferta especial
            </span>
            <span className="h-px w-5 bg-purple-400/40" />
          </div>

          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-3">
            Conhece o{" "}
            <span className="text-gradient-purple">Kit Segundo Cerebro</span>?
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto mb-6">
            De memoria permanente pro seu Claude Code. Ele lembra quem voce e, o que faz, e o que precisa — sem voce explicar de novo toda vez.
          </p>

          {/* Kiwify upsell widget */}
          <div
            id="kiwify-upsell-oT2C28S"
            data-upsell-url=""
            data-downsell-url=""
            style={{ textAlign: "center" }}
          >
            <button
              id="kiwify-upsell-trigger-oT2C28S"
              className="rounded-xl bg-purple-500 px-8 py-3 text-base font-bold text-white transition-all duration-200 hover:bg-purple-400 cursor-pointer purple-glow"
            >
              Sim, eu aceito essa oferta especial!
            </button>
            <div
              id="kiwify-upsell-cancel-trigger-oT2C28S"
              className="mt-4 cursor-pointer text-sm text-zinc-500 underline"
            >
              Nao, eu gostaria de recusar essa oferta
            </div>
          </div>
        </div>
      </div>

      {/* Kiwify upsell script */}
      <Script src="https://snippets.kiwify.com/upsell/upsell.min.js" strategy="lazyOnload" />
    </section>
  );
}
