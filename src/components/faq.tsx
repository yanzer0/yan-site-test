"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { SectionCta } from "@/components/section-cta";

const QUESTIONS = [
  {
    q: "Eu nunca programei na vida. Funciona pra mim?",
    a: "Sim. Os guias de IA foram feitos exatamente pra isso. Você cola o guia numa IA, e ela te ensina como se fosse um professor particular — um passo de cada vez, esperando você confirmar antes de seguir. Se der erro, ela resolve com você. Não precisa entender código.",
  },
  {
    q: "Funciona no meu computador?",
    a: "Funciona em Windows 10/11 e macOS. Precisa de Python (o guia ensina a instalar) e um microfone (pode ser o embutido do notebook). A detecção de palmas funciona 100% offline. Só a voz precisa de internet.",
  },
  {
    q: "Posso trocar a música, o app e a frase?",
    a: "Tudo. O guia de personalização te ensina a trocar a música (YouTube, Spotify, qualquer URL), o app que abre, o comando do terminal, a frase de voz, o idioma, a quantidade de palmas e a sensibilidade. Leva 5 minutos.",
  },
  {
    q: "É só o código cru? Ou tem suporte?",
    a: "Tem dois PDFs visuais (instalação e personalização) E dois guias de IA que funcionam como suporte infinito. A IA resolve qualquer problema que aparecer, sem limite de perguntas, sem fila, sem horário.",
  },
  {
    q: "O que vem no kit e como funciona o acesso?",
    a: "Você baixa um .zip com 8 arquivos: script Python (Win + Mac), instalador automático, dois PDFs visuais (instalação + personalização) e dois prompts de IA. Pagamento único de R$19,90. Sem assinatura, sem login em plataforma, sem upsell. Download imediato após o pagamento, é seu pra sempre.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-6 flex items-start gap-3 text-left cursor-pointer group"
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-zinc-300 text-[13px] font-bold group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors duration-200">
          ?
        </span>
        <h3 className="font-heading text-[15px] font-semibold text-white leading-snug flex-1 group-hover:text-green-300 transition-colors duration-200">
          {q}
        </h3>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 flex-shrink-0 mt-0.5 transition-transform duration-300 ${
            open ? "rotate-180 text-green-400" : ""
          }`}
        />
      </button>
      <div className={`faq-answer ${open ? "open" : ""}`}>
        <div>
          <p className="text-sm text-zinc-400 leading-relaxed pl-9 pb-6">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const ref = useScrollReveal();

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight mb-10">
          Perguntas honestas,
          <br />
          <span className="font-punch text-gradient-green">respostas diretas.</span>
        </h2>

        <div>
          {QUESTIONS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        <SectionCta />
      </div>
    </section>
  );
}
