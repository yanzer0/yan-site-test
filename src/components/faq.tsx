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
    q: "R$19,90? Qual é o truque?",
    a: "Nenhum. Sem assinatura, sem upsell, sem paywall escondido. Você baixa o ZIP com os 8 arquivos e é seu pra sempre. O preço é acessível porque o objetivo é volume, não margem.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight mb-10">
          Perguntas honestas,
          <br />
          <span className="font-punch text-gradient-green">respostas diretas.</span>
        </h2>

        <div className="divide-y divide-white/5">
          {QUESTIONS.map((item) => (
            <div key={item.q} className="py-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-zinc-300 text-[13px] font-bold">
                  ?
                </span>
                <h3 className="font-heading text-[15px] font-semibold text-white leading-snug">
                  {item.q}
                </h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed pl-9">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
