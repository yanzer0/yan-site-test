import Image from "next/image";

export function Problem() {
  return (
    <section id="como-funciona" className="py-20 sm:py-28" style={{ background: 'linear-gradient(160deg, #000 30%, #0D1A08 70%, #1A2210 100%)' }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          Você viu o vídeo.
          <br />
          Quis fazer <span className="font-punch text-gradient-green">igual.</span>
        </h2>

        <p className="text-[15px] text-zinc-300 leading-relaxed mb-4">
          Aí abriu o Google. Descobriu que precisa de Python. Que precisa de
          bibliotecas. Que precisa entender FFT, transformada de Fourier, análise
          espectral, similaridade do cosseno. Que o microfone do Mac se comporta
          diferente do Windows. Que tem conflito de áudio, problema de permissão,
          threshold de amplitude...
        </p>

        <p className="text-[15px] text-zinc-200 font-semibold mb-4">
          Eu levei dias pra fazer funcionar. <span className="text-gradient-green">Você não precisa.</span>
        </p>

        <p className="text-[15px] text-zinc-300 leading-relaxed mb-8">
          O JARVIS Kit é o <span className="text-gradient-green font-semibold">código pronto</span> &mdash; testado no Windows e no Mac
          &mdash; com guia de instalação passo a passo e guia de personalização
          pra você trocar a música, o app, o comando e a frase de voz em 5
          minutos.
        </p>

        {/* Image 1 - Terminal screenshot */}
        <div className="rounded-lg overflow-hidden border border-white/8">
          <Image
            src="/jarvis-terminal.webp"
            alt="Terminal macOS com JARVIS rodando"
            width={1400}
            height={788}
            sizes="(max-width: 768px) 100vw, 700px"
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
