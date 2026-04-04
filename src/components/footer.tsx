import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/lockup-sem-fundo.png"
            alt="Infuser"
            width={100}
            height={28}
            className="h-7 w-auto"
          />
        </div>
        <p className="font-mono text-[11px] text-zinc-600 leading-relaxed">
          JARVIS Kit &middot; by Yan Galasso &middot; Infuser
        </p>
        <p className="font-mono text-[11px] text-zinc-600 mt-1">
          Produto digital &middot; Entrega imediata após pagamento
        </p>
      </div>
    </footer>
  );
}
