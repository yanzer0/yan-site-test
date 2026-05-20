"use client";

import React from "react";
import { ShieldCheck, Infinity as InfinityIcon, Quote } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

interface DeliverableItem {
  ext: string;
  title: string;
  desc: React.ReactNode;
  bonus?: boolean;
}

const DELIVERABLES: DeliverableItem[] = [
  {
    ext: ".py",
    title: "jarvis-windows.py",
    desc: (
      <>
        Script pronto pra Windows. <span className="text-gradient-green font-semibold">Comentado em português.</span>{" "}
        Você abre, lê, entende e muda o que quiser.
      </>
    ),
  },
  {
    ext: ".py",
    title: "jarvis-mac.py",
    desc: "Versão pra Mac, com Terminal e AppleScript já integrados. Sem gambiarra de portabilidade.",
  },
  {
    ext: ".bat",
    title: "setup-windows.bat",
    desc: (
      <>
        <span className="text-gradient-green font-semibold">Duplo clique</span> e tudo se instala sozinho. Você não
        mexe no terminal nenhuma vez na instalação.
      </>
    ),
  },
  {
    ext: ".pdf",
    title: "Guia de Instalação",
    desc: "Passo a passo, do zero ao primeiro “duas palmas e funcionou”. Cada comando, cada permissão explicada.",
  },
  {
    ext: ".pdf",
    title: "Guia de Personalização",
    desc: "Troca a música, o app, o comando de voz, o idioma, a quantidade de palmas e a sensibilidade. Cada uma em menos de 1 minuto.",
  },
  {
    ext: ".md",
    title: "Guia de Instalação (IA)",
    desc: (
      <>
        Cola no ChatGPT, Claude, Gemini, Manus (ou a IA que você quiser). A IA vira{" "}
        <span className="text-gradient-green font-semibold">o Yan</span> e te guia passo a passo na instalação e na
        resolução de bugs, dúvidas ou dificuldades. Sem fila, sem horário, sem limite de perguntas.
      </>
    ),
    bonus: true,
  },
  {
    ext: ".md",
    title: "Guia de Personalização (IA)",
    desc: "Mesma coisa pra personalizar. Um ajuste de cada vez, testando junto com você.",
    bonus: true,
  },
  {
    ext: ".txt",
    title: "README",
    desc: "Quick start em 3 passos pra quem já sabe o que tá fazendo.",
  },
];

export function Offer() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section id="oferta" className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
            Tudo isso por{" "}
            <span className="font-punch text-gradient-green">R$19,90.</span>
          </h2>
          <p className="text-center text-zinc-500 text-[15px] mb-10">
            No .zip que você baixa:
          </p>

          {/* Offer card */}
          <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm p-5 sm:p-8">
            {/* Deliverables list */}
            <ul className="flex flex-col gap-3">
              {DELIVERABLES.filter((d) => !d.bonus).map((file) => (
                <li
                  key={file.title}
                  className="rounded-lg border border-white/8 bg-zinc-950/85 p-5"
                >
                  <DeliverableHead ext={file.ext} title={file.title} />
                  <p className="text-[13.5px] text-zinc-400 leading-relaxed mt-2">
                    {file.desc}
                  </p>
                </li>
              ))}
            </ul>

            {/* Bonus section */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px flex-1 bg-green-500/20" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-green-400">
                  Bônus
                </span>
                <span className="h-px flex-1 bg-green-500/20" />
              </div>

              <ul className="flex flex-col gap-3">
                {DELIVERABLES.filter((d) => d.bonus).map((file) => (
                  <li
                    key={file.title}
                    className="rounded-lg border border-green-500/20 bg-zinc-950/85 bg-gradient-to-br from-zinc-950/85 to-green-950/40 p-5"
                  >
                    <DeliverableHead ext={file.ext} title={file.title} highlight />
                    <p className="text-[13.5px] text-zinc-300 leading-relaxed mt-2">
                      {file.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust block: guarantee + acesso vitalício */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/8 bg-zinc-950/85 p-5 flex items-start gap-3">
                <span
                  className="flex-shrink-0 mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/8 border border-green-500/15"
                  aria-hidden="true"
                >
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                </span>
                <div>
                  <div className="font-heading text-[14px] font-semibold text-white leading-snug">
                    7 dias de garantia incondicional
                  </div>
                  <div className="text-[13px] text-zinc-400 leading-snug mt-1">
                    Não funcionou ou não gostou, devolve o dinheiro. Sem pergunta.
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/8 bg-zinc-950/85 p-5 flex items-start gap-3">
                <span
                  className="flex-shrink-0 mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/8 border border-green-500/15"
                  aria-hidden="true"
                >
                  <InfinityIcon className="h-4 w-4 text-green-400" />
                </span>
                <div>
                  <div className="font-heading text-[14px] font-semibold text-white leading-snug">
                    Pagamento único
                  </div>
                  <div className="text-[13px] text-zinc-400 leading-snug mt-1">
                    Acesso vitalício. Sem assinatura, sem cobrança recorrente.
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded testimonial */}
            <figure className="mt-6 rounded-lg border-l-[3px] border-green-500 bg-zinc-950/85 p-5">
              <Quote className="h-4 w-4 text-green-400/60 mb-2" aria-hidden="true" />
              <blockquote className="text-[14.5px] text-zinc-200 leading-relaxed italic">
                Comprei sexta, instalei no domingo seguindo o guia de IA. Nunca
                tinha mexido com Python. Funcionou na segunda tentativa.
              </blockquote>
              <figcaption className="mt-3 flex items-center gap-2 text-[12.5px]">
                <span className="font-semibold text-white">Lucas Henrique</span>
                <span className="text-zinc-500">·</span>
                <span className="font-mono text-zinc-500">comprou em 15/05</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
    </>
  );
}

function DeliverableHead({
  ext,
  title,
  highlight = false,
}: {
  ext: string;
  title: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3 flex-wrap">
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded ${
          highlight
            ? "text-green-300 bg-green-500/10 border border-green-500/20"
            : "text-green-400/80 bg-green-500/[0.06] border border-green-500/10"
        }`}
      >
        {ext}
      </span>
      <h3 className="font-heading text-[15px] font-bold text-white">{title}</h3>
    </div>
  );
}
