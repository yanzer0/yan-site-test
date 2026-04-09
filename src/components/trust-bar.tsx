export function TrustBar() {
  return (
    <section className="py-6 border-t border-b border-white/5 bg-[#0A0A0A]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <p className="font-mono text-[13px] leading-relaxed text-zinc-500">
          O vídeo de demonstração atingiu{" "}
          <strong className="text-green-400">50 mil visualizações</strong> em{" "}
          <span className="text-gradient-green font-semibold">menos de 24 horas.</span>
          <br />
          Centenas de comentários pedindo o código.
          <br />
          <span className="text-zinc-300">Aqui está.</span>
        </p>
      </div>
    </section>
  );
}
