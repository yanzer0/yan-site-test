import Image from "next/image";

export function Problem() {
  return (
    <section id="como-funciona" className="py-20 sm:py-28 bg-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          Você viu o vídeo.
          <br />
          Quis fazer <span className="text-green-400">igual.</span>
        </h2>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-4">
          Aí abriu o Google. Descobriu que precisa de Python. Que precisa de
          bibliotecas. Que precisa entender FFT, transformada de Fourier, análise
          espectral, similaridade do cosseno. Que o microfone do Mac se comporta
          diferente do Windows. Que tem conflito de áudio, problema de permissão,
          threshold de amplitude...
        </p>

        <p className="text-[15px] text-zinc-200 font-semibold mb-4">
          Eu levei dias pra fazer funcionar. Você não precisa.
        </p>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-8">
          O JARVIS Kit é o código pronto &mdash; testado no Windows e no Mac
          &mdash; com guia de instalação passo a passo e guia de personalização
          pra você trocar a música, o app, o comando e a frase de voz em 5
          minutos.
        </p>

        {/* Image 1 - Terminal screenshot */}
        <div className="rounded-2xl overflow-hidden border border-green-500/10">
          <Image
            src="/jarvis-terminal.png"
            alt="Terminal macOS com JARVIS rodando"
            width={1400}
            height={788}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
