import Image from "next/image";

export function Technical() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-green-400 mb-4">
          Pra quem quer entender
        </p>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          Não é volume.
          <br />
          É <span className="font-punch text-gradient-green">fingerprint espectral.</span>
        </h2>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-4">
          A maioria dos projetos de &quot;detecção de palma&quot; na internet usa
          amplitude — se o som é alto, conta. Isso detecta teclado, batida na
          mesa, porta fechando. Não funciona.
        </p>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-4">
          O JARVIS usa análise espectral. Na calibração, ele grava o{" "}
          <strong className="text-white">formato</strong> do som da sua palma —
          como uma impressão digital sonora. Depois, em tempo real, compara cada
          som contra esse perfil usando similaridade do cosseno.
        </p>

        <p className="text-[15px] text-white font-semibold leading-relaxed mb-8">
          Batida na mesa? 45% de similaridade. Descartado.
          <br />
          Estalo de dedo? 55%. Descartado.
          <br />
          <span className="text-gradient-green">Sua palma? 87%. Ativado.</span>
        </p>

        {/* Image 3 - Spectrum */}
        <div className="rounded-lg overflow-hidden border border-green-500/10">
          <Image
            src="/jarvis-spectrum.png"
            alt="Comparação de espectros: batida na mesa vs estalo vs palma"
            width={1400}
            height={788}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
