"use client";

export function SegundoCerebroUpsell({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="rounded-lg border border-green-500/20 bg-green-500/[0.04] p-8 sm:p-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-5 bg-green-400/40" />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-green-400/70">
              Conheça também
            </span>
            <span className="h-px w-5 bg-green-400/40" />
          </div>

          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-3">
            Conhece o{" "}
            <span className="text-gradient-green">Kit Segundo Cérebro</span>?
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto mb-6">
            Dê <span className="text-gradient-green font-semibold">memória permanente</span> pro seu Claude Code. Ele lembra quem você é, o que faz, e o que precisa — <span className="text-gradient-green font-semibold">sem explicar de novo.</span>
          </p>

          <button
            onClick={onNavigate}
            className="rounded-lg bg-green-500 px-8 py-3 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 cursor-pointer green-glow"
          >
            Conhecer o Segundo Cérebro &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}
