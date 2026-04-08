"use client";

interface SegundoCerebroProps {
  onBack: () => void;
}

export function SegundoCerebro({ onBack }: SegundoCerebroProps) {
  return (
    <>
      <header className="fixed top-4 left-4 right-4 z-50">
        <nav className="mx-auto max-w-3xl glass rounded-2xl px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            &larr; Voltar
          </button>
          <span className="font-heading text-sm font-semibold text-purple-400">
            Segundo Cerebro
          </span>
          <div className="w-16" />
        </nav>
      </header>

      <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Purple glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center px-4">
          <div className="animate-fade-in-up inline-flex items-center gap-3 mb-6">
            <span className="h-px w-5 bg-purple-400" />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-purple-400">
              Em breve
            </span>
            <span className="h-px w-5 bg-purple-400" />
          </div>

          <h1 className="animate-fade-in-up delay-100 font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
            Kit{" "}
            <span className="text-gradient-purple">Segundo Cerebro</span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-lg text-zinc-400 max-w-md mx-auto mb-10">
            Pagina em construcao.
          </p>

          <button
            onClick={onBack}
            className="animate-fade-in-up delay-300 inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-transparent px-6 py-4 text-sm font-medium text-purple-400 transition-all duration-200 hover:border-purple-400 hover:bg-purple-500/5 cursor-pointer"
          >
            &larr; Voltar aos Kits
          </button>
        </div>
      </main>
    </>
  );
}
