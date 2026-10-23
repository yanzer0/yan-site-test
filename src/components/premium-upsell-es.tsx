"use client";

import { useEffect, useState } from "react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const PRICING = { usd: "US$ 27", eur: "€ 29" };
const PREMIUM_CHECKOUT_URL = {
  usd: "[checkout]", // TODO(Yan): definir checkout USD
  eur: "[checkout]", // TODO(Yan): definir checkout EUR
};
const DECLINE_URL = "[thank-you]"; // TODO(Yan): definir

const PREMIUM_ITEMS = [
  { title: "Todo lo que incluye el Kit básico.", description: "Además de /comecar para configurar tu cerebro con una entrevista guiada, y /aprendi para guardar correcciones." },
  { title: "Se mantiene al día.", description: "El índice, el estado actual y las tareas pendientes se regeneran a partir de tus notas guardadas en cada sesión." },
  { title: "Empieza con el contexto del día.", description: "La fecha, los proyectos activos, las tareas abiertas y las vencidas, antes de tu primer mensaje." },
  { title: "Los pendientes aparecen cuando hacen falta.", description: "Menciona un cliente o proyecto y las tareas relacionadas aparecen en la conversación." },
  { title: "Conserva lo que aprende de tus correcciones.", description: "/aprendi guarda una corrección y la recupera cuando vuelve a surgir el mismo tema." },
  { title: "Encuentra el contexto que importa.", description: "Una regla obliga al agente a leer el índice antes de buscar entre tus notas, reduciendo lecturas innecesarias." },
  { title: "Mantén tus notas en orden.", description: "Las comprobaciones al final de cada turno detectan notas sin cabecera y tareas con un formato incorrecto." },
  { title: "Un cerebro para Claude Code y Codex.", description: "Usa las mismas notas, rutinas automáticas y comandos en las dos aplicaciones." },
  { title: "Instala sin escribir comandos en la terminal.", description: "El agente ejecuta el instalador y comprueba que funciona. Sigue la guía para Windows, macOS o Linux." },
];

export function PremiumUpsellEs() {
  const revealRef = useScrollReveal();
  const [currency, setCurrency] = useState<"usd" | "eur">("usd");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("moneda") === "eur") {
      setCurrency("eur");
    }
  }, []);

  return (
    <main lang="es" className="min-h-screen bg-black text-white">
      <div className="border-b border-green-500/20 bg-green-500/[0.06] px-5 py-4 text-center text-sm leading-relaxed text-green-300">
        Tu compra del Kit está confirmada. Recibirás los datos de acceso por correo electrónico.
      </div>

      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-green-400">Segundo Cerebro Premium</p>
          <h1 className="font-punch text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
            Deja de mantener tu segundo cerebro a mano.
            <span className="mt-2 block text-gradient-green">Premium lo mantiene al día.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-300">
            Un segundo cerebro deja de ser útil cuando dejas de actualizar su índice y sus tareas pendientes.
            Con el Kit básico, ese mantenimiento depende de ti. Premium se encarga en cada sesión, a partir de las notas que guardas.
          </p>
        </header>

        <section aria-labelledby="premium-benefits" className="mt-10">
          <h2 id="premium-benefits" className="mb-5 font-heading text-xl font-bold">Qué añade Premium</h2>
          <div ref={revealRef} className="scroll-reveal">
            <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {PREMIUM_ITEMS.map((item) => (
                <li key={item.title} className="flex gap-3 text-sm leading-relaxed">
                  <span aria-hidden="true" className="shrink-0 text-green-400">&#10003;</span>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-zinc-400">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 border-t border-white/10 pt-4 text-sm leading-relaxed text-zinc-400">
            Premium mantiene lo que guardas. Usa /end-session para registrar una conversación.
            En Codex, también debes revisar y activar las rutinas automáticas (hooks) una vez después de instalar.
          </p>
        </section>

        <section aria-labelledby="premium-offer" className="mx-auto mt-8 max-w-lg rounded-2xl border border-green-500/40 bg-green-500/[0.04] p-6 text-center sm:p-8">
          <h2 id="premium-offer" className="font-heading text-xl font-bold">Mejora tu Kit con Premium</h2>
          <p className="my-4 font-punch text-5xl font-extrabold tracking-tight text-gradient-green">{PRICING[currency]}</p>
          <p className="mb-5 text-sm text-zinc-400">Pago único</p>
          <a
            id="hotmart-upsell-accept"
            href={PREMIUM_CHECKOUT_URL[currency]}
            className="green-glow flex min-h-12 items-center justify-center rounded-xl bg-green-500 px-5 py-3 text-base font-bold text-black transition-colors hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-green-300"
          >
            Sí, añade Premium a mi Kit
          </a>
          {/* TODO(Yan): colar aqui o script do funil one-click da Hotmart (Ferramentas > Funil de vendas) */}
          <a href={DECLINE_URL} className="mt-5 inline-flex min-h-11 items-center text-sm text-zinc-400 underline underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-green-300">
            No, gracias. Me quedo con el Kit básico
          </a>
        </section>
      </div>
    </main>
  );
}
