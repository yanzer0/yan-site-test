"use client";

import { useScrollReveal } from "@/lib/use-scroll-reveal";

const PRICING = { price: "US$ 47" };
const PREMIUM_CHECKOUT_URL = "[checkout]"; // TODO(Yan): definir
const DECLINE_URL = "[thank-you]"; // TODO(Yan): definir

const PREMIUM_ITEMS = [
  { title: "Everything in the basic Kit.", description: "Plus /comecar to set up your brain through a guided interview, and /aprendi to save corrections." },
  { title: "It keeps itself up to date.", description: "Your index, current status and open tasks are rebuilt from saved notes each session." },
  { title: "Start with today's context.", description: "See the date, active projects, open tasks and overdue items before your first prompt." },
  { title: "Open tasks come back when relevant.", description: "Mention a client or project and matching tasks surface in the conversation." },
  { title: "Keep the lessons from your corrections.", description: "/aprendi saves a correction and brings it back when the same topic comes up." },
  { title: "Find the context that matters.", description: "A guard makes the agent read the index before searching across your notes, reducing unnecessary reading." },
  { title: "Keep your notes in shape.", description: "End-of-turn checks flag missing note headers and incorrectly formatted tasks." },
  { title: "One brain for Claude Code and Codex.", description: "Use the same notes, automatic routines and commands in both apps." },
  { title: "Install without typing terminal commands.", description: "The agent runs the installer and checks that it works. Follow the guide for Windows, macOS or Linux." },
];

export function PremiumUpsellEn() {
  const revealRef = useScrollReveal();

  return (
    <main lang="en" className="min-h-screen bg-black text-white">
      <div className="border-b border-green-500/20 bg-green-500/[0.06] px-5 py-4 text-center text-sm leading-relaxed text-green-300">
        Your Kit purchase is confirmed. Your access details will arrive by email.
      </div>

      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-green-400">Second Brain Premium</p>
          <h1 className="font-punch text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
            Stop maintaining your second brain.
            <span className="mt-2 block text-gradient-green">Let Premium keep it up to date.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-300">
            A second brain stops being useful when you stop updating its index and open tasks.
            The basic Kit leaves that upkeep to you. Premium handles it each session, using the notes you save.
          </p>
        </header>

        <section aria-labelledby="premium-benefits" className="mt-10">
          <h2 id="premium-benefits" className="mb-5 font-heading text-xl font-bold">What Premium adds</h2>
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
            Premium maintains what you save. Use /end-session to record a conversation.
            In Codex, you also review and enable the automatic routines (hooks) once after installation.
          </p>
        </section>

        <section aria-labelledby="premium-offer" className="mx-auto mt-8 max-w-lg rounded-2xl border border-green-500/40 bg-green-500/[0.04] p-6 text-center sm:p-8">
          <h2 id="premium-offer" className="font-heading text-xl font-bold">Upgrade to Premium</h2>
          <p className="my-4 font-punch text-5xl font-extrabold tracking-tight text-gradient-green">{PRICING.price}</p>
          <p className="mb-5 text-sm text-zinc-400">One-time payment</p>
          <a
            id="hotmart-upsell-accept"
            href={PREMIUM_CHECKOUT_URL}
            className="green-glow flex min-h-12 items-center justify-center rounded-xl bg-green-500 px-5 py-3 text-base font-bold text-black transition-colors hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-green-300"
          >
            Yes, add Premium to my Kit
          </a>
          {/* TODO(Yan): colar aqui o script do funil one-click da Hotmart (Ferramentas > Funil de vendas) */}
          <a href={DECLINE_URL} className="mt-5 inline-flex min-h-11 items-center text-sm text-zinc-400 underline underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-green-300">
            No thanks, I&apos;ll keep the basic Kit
          </a>
        </section>
      </div>
    </main>
  );
}
