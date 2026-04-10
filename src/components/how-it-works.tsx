"use client";

import React from "react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const FILES: { ext: string; title: string; desc: React.ReactNode; highlight: boolean }[] = [
  {
    ext: ".py",
    title: "jarvis-windows.py",
    desc: <>Codigo completo pra Windows. <span className="text-gradient-green font-semibold">Comentado em portugues.</span> Secao de configuracao separada — voce edita so o que precisa.</>,
    highlight: false,
  },
  {
    ext: ".py",
    title: "jarvis-mac.py",
    desc: "Codigo completo pra macOS. Mesma estrutura, adaptado pra Terminal, AppleScript e sons nativos do Mac.",
    highlight: false,
  },
  {
    ext: ".bat",
    title: "setup-windows.bat",
    desc: <><span className="text-gradient-green font-semibold">Duplo clique</span> e ele instala todas as dependencias automaticamente. <span className="text-gradient-green font-semibold">Zero terminal.</span></>,
    highlight: false,
  },
  {
    ext: ".pdf",
    title: "Guia de Instalacao",
    desc: <>Passo a passo visual com as instrucoes detalhadas. <span className="text-gradient-green font-semibold">Do zero.</span> Python, bibliotecas, permissoes, calibracao.</>,
    highlight: false,
  },
  {
    ext: ".pdf",
    title: "Guia de Personalizacao",
    desc: "Como trocar a musica, o app, o comando do terminal, a frase de voz, o idioma, a quantidade de palmas e a sensibilidade.",
    highlight: false,
  },
  {
    ext: ".md",
    title: "Guia de Instalacao (IA)",
    desc: <>Cola no Claude, ChatGPT ou qualquer IA. Ela vira seu <span className="text-gradient-green font-semibold">professor particular</span> e te guia ate funcionar.</>,
    highlight: true,
  },
  {
    ext: ".md",
    title: "Guia de Personalizacao (IA)",
    desc: <>Cola na IA e ela te ensina a personalizar tudo — um ajuste de cada vez, <span className="text-gradient-green font-semibold">testando junto com voce.</span></>,
    highlight: true,
  },
  {
    ext: ".txt",
    title: "README",
    desc: "Quick start em 3 passos pra quem ja sabe o que ta fazendo.",
    highlight: false,
  },
];

export function Includes() {
  const ref = useScrollReveal();

  return (
    <>
      <div className="section-divider" />
      <section className="py-20 sm:py-28">
        <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
            8 arquivos.{" "}
            <span className="font-punch text-gradient-green">Zero enrolacao.</span>
          </h2>
          <p className="text-center text-zinc-500 text-[15px] mb-12">
            Tudo que voce precisa pra instalar, rodar e personalizar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FILES.map((file) => (
              <div
                key={file.title}
                className={`glass card-hover p-6 ${
                  file.highlight
                    ? "border-green-500/15 bg-gradient-to-br from-white/5 to-green-500/[0.03]"
                    : ""
                }`}
              >
                <div
                  className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${
                    file.highlight ? "text-green-400" : "text-green-400/70"
                  }`}
                >
                  {file.highlight && "* "}
                  {file.ext}
                </div>
                <h3 className="font-heading text-[15px] font-bold text-white mb-2">
                  {file.title}
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  {file.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
