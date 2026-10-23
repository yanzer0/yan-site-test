"use client";

import { useEffect, useRef, useState } from "react";
import { X, Code2, Target, BookOpen, Video, BarChart3, Expand, ChevronDown, ShoppingBag } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import Image from "next/image";

const PRICING = {
  usd: { kit: "US$ 17", claudeProMonth: "US$ 20" },
  eur: { kit: "€ 19", claudeProMonth: "Un mes" },
};

type Currency = keyof typeof PRICING;
type Pricing = (typeof PRICING)[Currency];

const CHECKOUT_URL = {
  usd: "https://pay.hotmart.com/O108099140A?checkoutMode=10&bid=1792518047033", // TODO(Yan/Iago): confirmar checkout internacional USD
  eur: "https://pay.hotmart.com/O108099140A?checkoutMode=10&bid=1792518047033", // TODO(Yan/Iago): confirmar checkout internacional EUR
};



function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[101] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5 text-white" />
      </button>
      <div className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt={alt}
          width={2560}
          height={2560}
          className="w-auto h-auto max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          quality={95}
          priority
        />
      </div>
    </div>
  );
}


function ZoomableImage({ src, alt, width, height, className, containerClassName, quality = 80, sizes = "(max-width: 768px) 100vw, 1024px", children }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  containerClassName?: string;
  quality?: number;
  sizes?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`group relative cursor-zoom-in ${containerClassName ?? ""}`} onClick={() => setOpen(true)}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={className}
          quality={quality}
        />
        {children}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 pointer-events-none" />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <span className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm border border-white/10">
            <Expand className="h-3 w-3" />
            Ver imagen completa
          </span>
        </div>
      </div>
      {open && <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}


const FINAL_CTA_ID = "cta-comprar-final";

function scrollToFinalCta() {
  document
    .getElementById(FINAL_CTA_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}


function SectionCta() {
  return (
    <div className="mt-14 flex justify-center">
      <a
        href="#comprar"
        className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-8 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer"
      >
        Quiero el Kit Segundo Cerebro <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">&rarr;</span>
      </a>
    </div>
  );
}

const BUYER_NAMES = [
  "Amanda Pinto", "Henrique da Conceição", "Reginaldo de Melo", "Felipe Marques",
  "Adriano dos Reis", "Wilson de Andrade", "Renata Gomes", "Juliana Alves",
  "Márcio Leite", "Marco do Nascimento", "Diogo Amorim", "Wilson Fernandes",
  "Bruna Queiroz", "Luana Morais", "Thaís Nogueira", "Lara de Moraes",
  "Marcos Vieira", "Daniel Gonçalves", "Natália Cordeiro", "André Cavalcante",
  "Eliane de Carvalho", "Renato Henrique", "Nicolas Menezes", "Valdir de Jesus",
  "Alessandra Martins", "Rita Coelho", "Davi da Rosa", "Márcia Nogueira",
  "Rodrigo Farias", "Mariana de Almeida", "Willian Amaral", "Janaína de Jesus",
  "Tiago de Assis", "Douglas da Cruz", "Nelson de Souza", "Daniele Medeiros",
  "Gilberto Gonçalves", "Alex de Brito", "Diogo Marques", "Tiago Borges",
  "Felipe Filho", "Viviane Amorim", "Michele Silveira", "Raimundo de Lima",
  "Rita Silveira", "Marina Corrêa", "Simone Martins", "Renan Miranda",
  "Felipe Silveira", "Raimundo Alves", "Alex Neto", "Thiago Martins",
  "Ana Sales", "Leandro Filho", "Raimundo Lopes", "Victor Amorim",
  "Larissa Aguiar", "Antônio Maria", "Lucas Pinto", "André Fernandes",
  "Sebastião Teixeira", "Guilherme Correia", "Antônia Correia", "Emerson de Sousa",
  "Artur Amorim", "Renan da Costa", "Luana Maria", "Sara Machado",
  "Fernando da Silva", "Henrique Farias", "Artur da Conceição", "Nicolas Borges",
  "Luis Rodrigues", "Tiago Henrique", "Anderson de Brito", "Edson Morais",
  "Lúcia Farias", "Fabrício da Conceição", "Renato França", "Raimundo da Cruz",
  "Sebastião Batista", "Raquel Dias", "Fernando Machado", "Bruna Cavalcante",
  "Alexandre Henrique", "Daniel Aparecida", "Adriana Lopes", "Bruna Nogueira",
  "Sandra de Paula", "Antônia Bezerra", "Flávia de Jesus", "Murilo Ribeiro",
  "Gabriel de Carvalho", "Júlio Sales", "Sônia Pinto", "Janaína Dias",
  "Maria Sales", "Emerson Coelho", "Henrique de Araújo", "Eduardo de Oliveira",
];


function SocialProofToast() {
  const [current, setCurrent] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const lastIndex = useRef<number>(-1);

  useEffect(() => {
    const mountId = setTimeout(() => setMounted(true), 0);
    let showTimeout: ReturnType<typeof setTimeout>;
    let hideTimeout: ReturnType<typeof setTimeout>;

    const pickName = () => {
      let idx = Math.floor(Math.random() * BUYER_NAMES.length);
      if (idx === lastIndex.current) idx = (idx + 1) % BUYER_NAMES.length;
      lastIndex.current = idx;
      return BUYER_NAMES[idx];
    };

    const scheduleNext = () => {
      const delay = 10_000 + Math.random() * 15_000; // 10-25s
      showTimeout = setTimeout(() => {
        setCurrent(pickName());
        hideTimeout = setTimeout(() => {
          setCurrent(null);
          scheduleNext();
        }, 5000);
      }, delay);
    };

    scheduleNext();
    return () => {
      clearTimeout(mountId);
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  if (!mounted) return null;

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .filter((p) => p.length > 2)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 max-w-[280px] sm:max-w-xs transition-all duration-500 motion-reduce:transition-none ${
        current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {current && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-black/90 backdrop-blur-md px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-[11px] font-bold text-black">
            {initials(current)}
          </span>
          <div className="flex-1 min-w-0 text-[13px] leading-tight">
            <div className="font-semibold text-white truncate">{current}</div>
            <div className="text-[11px] text-green-300">Ya tiene el Kit Segundo Cerebro</div>
          </div>
          <ShoppingBag className="h-4 w-4 text-green-400 flex-shrink-0" />
        </div>
      )}
    </div>
  );
}


function HeroSection() {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">

        <h1 className="animate-fade-in-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
          Configúralo una vez.
          <br />
          <span className="font-punch text-gradient-green">Que recuerde por ti.</span>
        </h1>


        <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed">
          El sistema completo para dar <strong className="text-gradient-green font-semibold">memoria permanente</strong> a tu Claude Code. Recuerda quién eres, en qué trabajas y qué necesitas. <strong className="text-white">Sin volver a explicarlo en cada conversación.</strong>
        </p>


        <div className="animate-fade-in-up delay-300 mt-10 max-w-2xl mx-auto rounded-lg overflow-hidden border border-green-500/10">
          <video
            src="/video-segundo-cerebro.mp4"
            className="w-full aspect-video object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        </div>


        <div className="animate-fade-in-up delay-400 mt-10 flex flex-col items-center">
          <a
            href="#comprar"
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            ¡Quiero mi Segundo Cerebro! <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </a>
          <a
            href="#como-funciona"
            className="group/scroll mt-5 inline-flex flex-col items-center gap-1 text-green-300/60 hover:text-green-300 transition-colors duration-200 cursor-pointer"
          >
            <span className="font-mono text-[13px] font-medium tracking-wide">Descubre cómo funciona</span>
            <span className="animate-bounce text-lg">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}


function PainSection() {
  const ref = useScrollReveal();
  const PAIN_ITEMS = [
    "Abres un chat nuevo y tienes que explicarlo todo desde cero",
    "Pierdes 5 minutos dando contexto antes de cada tarea",
    "La respuesta es genérica porque no te conoce",
    "No recuerda en qué trabajaron ayer",
    "No sabe qué decisiones has tomado",
    "Vuelve a proponer ideas que descartaste hace semanas",
    "Cada sesión empieza desde cero, como si fuera la primera conversación",
  ];

  return (
    <>
    <div className="section-divider" />
    <section id="como-funciona" className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">
          ¿Te suena esta situación?
        </h2>

        <div className="space-y-5 mb-10">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Abres Claude Code para resolver una tarea. Antes de empezar, te toca ponerlo al día. Otra vez.
          </p>
          <p className="text-[15px] text-zinc-300 italic leading-relaxed">
            &ldquo;Trabajo por mi cuenta, hago diseño, este es mi público, estas son mis tarifas, este es el proyecto y esto es lo que pidió el cliente...&rdquo;
          </p>
          <p className="text-[15px] font-semibold">
            <span className="text-gradient-green">Una. Y otra. Vez.</span>
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Escribes un párrafo entero antes de hacer la pregunta que te interesa. Y aun así recibes una respuesta genérica. A Claude le falta el contexto de tu trabajo.
          </p>
        </div>


        <div className="h-px bg-white/5 my-10" />


        <div className="space-y-4 mb-10">
          {PAIN_ITEMS.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center">
                <span className="text-red-400 text-xs font-bold">×</span>
              </span>
              <span className="text-[15px] text-zinc-400 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>


        <div className="h-px bg-white/5 my-10" />


        <div className="space-y-5">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Lo frustrante es saber que Claude puede dar mucho más. Ves el potencial, pero trabaja como un socio brillante que cada mañana ha olvidado lo del día anterior.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Multiplica eso por semanas. Por meses. ¿Cuántas horas has perdido repitiendo lo mismo?
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            ¿Cuántas respuestas genéricas has aceptado por no explicar otra vez todo el contexto?
          </p>
          <p className="text-[15px] text-white font-semibold leading-relaxed">
            Y algo más: ¿cuántas veces has <span className="text-gradient-green">dejado de usar Claude</span> porque volver a explicarlo todo te quitaba las ganas?
          </p>
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}


function RevelationSection() {
  const ref = useScrollReveal();
  const BENEFITS = [
    "Sabe quién eres y a qué te dedicas",
    "Recuerda tus proyectos, objetivos y decisiones",
    "Actualiza su memoria en cada sesión de trabajo",
    "Ejecuta tareas complejas con un solo comando",
    "Cuenta con más contexto cuanto más lo usas",
    "Trabaja como un socio que conserva el contexto",
  ];

  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          ¿Y si lo configuraras{" "}
          <span className="font-punch text-gradient-green">una vez</span>{" "}
          para dejar de empezar desde cero?
        </h2>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-6">
          Imagina abrir Claude Code un lunes por la mañana. En lugar de pasar 10 minutos explicando el contexto, escribes una línea:
        </p>


        <div className="rounded-lg bg-[#0d0d0d] border border-green-500/15 p-5 mb-6 font-mono">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <p className="text-green-400 text-sm">
            <span className="text-zinc-500">$</span> /daily-briefing
          </p>
        </div>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-2">
          Y recibes un resumen completo del día: lo pendiente de la semana pasada, los proyectos activos, las decisiones recientes, lo urgente y por dónde empezar.
        </p>
        <p className="text-[15px] text-white font-semibold mb-4">
          Sin volver a darle contexto. Porque <span className="text-gradient-green">ya tiene la información.</span>
        </p>


        <div className="rounded-lg overflow-hidden border border-green-500/10 mb-10 image-frame">
          <ZoomableImage
            src="/segundo-cerebro/daily-briefing.webp"
            alt="Resultado de /daily-briefing, resumen del día con oportunidades comerciales y prioridades"
            width={1065}
            height={1398}
            className="w-full h-auto"
            quality={90}
          />
        </div>


        <div className="h-px bg-white/5 my-10" />


        <div className="space-y-4 mb-10">
          {BENEFITS.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
                <span className="text-green-400 text-xs font-bold">&#10003;</span>
              </span>
              <span className="text-[15px] text-zinc-400 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>


        <div className="h-px bg-white/5 my-10" />


        <div className="space-y-5">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            No tienes que esperar a una futura función de Claude. <strong className="text-gradient-green font-semibold">Este sistema ya funciona.</strong>
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Es un sistema de memoria persistente que usa Obsidian como base de archivos y Claude Code como cerebro. Tú aportas la información sobre tu trabajo. El sistema la guarda y la utiliza para responder con contexto.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Lo construí para mi propio trabajo. Pasé semanas ajustando las reglas, las protecciones, la lógica de memoria y los comandos. Todo eso está reunido en un kit que puedes configurar con tus datos.
          </p>
        </div>


        <div className="rounded-lg overflow-hidden border border-green-500/10 mt-8 image-frame">
          <ZoomableImage
            src="/segundo-cerebro/8-comandos.webp"
            alt="Carpeta .claude/commands/, 8 comandos listos para usar"
            width={939}
            height={374}
            className="w-full h-auto"
            quality={90}
          />
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}


function DailyBriefingCard() {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="md:col-span-5 glass border-green-500/10 rounded-lg overflow-hidden flex flex-col group">
      <div className="flex-1 relative min-h-[400px] cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/segundo-cerebro/daily-briefing.webp"
          alt="Resultado de /daily-briefing en la terminal"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0d0f0d] to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 pointer-events-none" />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <span className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm border border-white/10">
            <Expand className="h-3 w-3" />
            Ver imagen completa
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-mono text-green-400 text-sm font-bold mb-2">/daily-briefing</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed">
          Un comando. El resumen del día con lo que necesitas tener presente.
        </p>
      </div>
      {lightboxOpen && (
        <ImageLightbox
          src="/segundo-cerebro/daily-briefing.webp"
          alt="Resultado de /daily-briefing en la terminal"
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}


function DemoSection() {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
          Mira lo que hace con{" "}
          <span className="font-punch text-gradient-green">un solo comando</span>
        </h2>
        <p className="text-center text-zinc-500 text-[15px] mb-12">
          Capturas reales del sistema en funcionamiento. Los ejemplos originales están en portugués.
        </p>


        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:items-stretch">


          <DailyBriefingCard />

          <div className="md:col-span-7 flex flex-col gap-4">

            <div className="glass border-green-500/10 rounded-lg overflow-hidden image-frame">
              <div className="overflow-hidden rounded-t-lg">
                <ZoomableImage
                  src="/segundo-cerebro/braindump.webp"
                  alt="Resultado de /braindump en la terminal"
                  width={1065}
                  height={748}
                  className="w-full h-auto"
                />
              </div>
              <div className="p-5">
                <h3 className="font-mono text-green-400 text-sm font-bold mb-2">/braindump</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  ¿Tienes una idea? Compártela con tu segundo cerebro. La captura, la conecta con lo que ya tienes y la archiva.
                </p>
              </div>
            </div>


            <div className="glass border-green-500/10 rounded-lg overflow-hidden image-frame">
              <div className="overflow-hidden rounded-t-lg max-h-[400px] relative">
                <ZoomableImage
                  src="/segundo-cerebro/end-session.webp"
                  alt="Resultado de /end-session, cierre completo de la sesión"
                  width={1070}
                  height={1559}
                  className="w-full h-auto"
                >
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0f0d] to-transparent pointer-events-none" />
                </ZoomableImage>
              </div>
              <div className="p-5">
                <h3 className="font-mono text-green-400 text-sm font-bold mb-2">/end-session</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  ¿Terminaste de trabajar? Un comando reúne lo ocurrido, actualiza la memoria y registra decisiones y aprendizajes.{" "}
                  <strong className="text-gradient-green">Cuando vuelvas mañana, tendrás el punto de partida guardado.</strong>
                </p>
              </div>
            </div>
          </div>


          <div className="md:col-span-12 glass border-green-500/10 rounded-lg overflow-hidden image-frame">
            <div className="overflow-hidden rounded-t-lg">
              <ZoomableImage
                src="/segundo-cerebro/obsidian-full.webp"
                alt="Base de archivos en Obsidian, panel de carpetas y nota current-state abierta"
                width={2559}
                height={1379}
                className="w-full h-auto"
              />
            </div>
            <div className="p-5">
              <h3 className="font-mono text-green-400 text-sm font-bold mb-2">Tu base de archivos en Obsidian</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                Todo organizado. Memoria, conocimientos, aprendizajes, decisiones y oportunidades comerciales. Los archivos se conectan entre sí.
              </p>
            </div>
          </div>

        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}


function KitContentsSection() {
  const CARDS = [
    {
      title: "CLAUDE.md - El motor de tu segundo cerebro",
      desc: "Cientos de líneas de instrucciones depuradas: identidad personalizable, reglas de memoria, límites de escritura, protección frente a la inyección de instrucciones, actualización de memoria, módulo de negocio opcional y tabla de comandos. Este archivo hace funcionar el sistema. Pasé semanas afinándolo.",
      highlight: true,
    },
    {
      title: "8 comandos listos para usar",
      desc: "4 comandos universales (daily-briefing, end-session, braindump, weekly-review), 1 adaptable (content-idea) y 3 del módulo de negocio (prospect-research, pipeline, proposal-generator). Cada uno incluye lógica condicional y un formato de respuesta definido.",
      highlight: true,
    },
    {
      title: "4 instrucciones de configuración",
      desc: "Crean la estructura de archivos, generan las plantillas de conocimiento, inicializan la memoria y comprueban que todo funciona. No tienes que memorizar los pasos. Copia, pega y sigue las indicaciones.",
      highlight: false,
    },
    {
      title: "9 plantillas de conocimiento",
      desc: "4 universales (about-me, goals, projects, references) y 5 del módulo de negocio (positioning, icp, services, tone-of-voice, pricing). Cada plantilla incluye preguntas que te ayudan a completarla sin quedarte ante una pantalla en blanco.",
      highlight: false,
    },
    {
      title: "Guía de instalación",
      desc: "Desde cero hasta tu base de archivos en funcionamiento. Pasos con capturas para instalar Obsidian y Claude Code, configurar y probar. Incluye la configuración de sincronización con Git para copias de seguridad automáticas.",
      highlight: false,
    },
    {
      title: "Guía de personalización",
      desc: "Convierte la plantilla en TU segundo cerebro. Con ejemplos para profesionales independientes, desarrolladores, estudiantes, creadores de contenido y responsables de equipo. Incluye consejos avanzados para crear comandos.",
      highlight: false,
    },
    {
      title: "Soporte con IA sin límite de consultas",
      desc: "Pega las instrucciones en un chat nuevo y tendrás un asistente con el contexto del kit. Consulta dudas, personaliza, revisa errores y crea comandos. Disponible las 24 horas, sin colas ni solicitudes de soporte.",
      highlight: true,
    },
    {
      title: "Base de archivos con la estructura preparada",
      desc: "No empiezas desde cero. Incluye las carpetas organizadas (_memory, _knowledge, _learnings, _decisions, _sessions, _pipeline), primeros pasos (START-HERE.md), un ejemplo de seguimiento comercial y .gitignore configurado. Descomprime y empieza a configurarlo.",
      highlight: false,
    },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section id="kit" className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
          Qué incluye el kit
        </h2>
        <p className="text-center text-[15px] text-zinc-400 mb-4">
          Abre los archivos y empieza. Tienes un{" "}
          <strong className="text-gradient-green font-semibold">sistema listo para configurar.</strong>{" "}
          Descomprime, añade tus datos y pon en marcha tu segundo cerebro.
        </p>


        <div className="space-y-4 mb-12">

          <div className="rounded-lg overflow-hidden border border-green-500/10 image-frame">
            <ZoomableImage
              src="/segundo-cerebro/claude-md.webp"
              alt="CLAUDE.md abierto, cientos de líneas de instrucciones para la IA"
              width={2123}
              height={1327}
              className="w-full h-auto"
            />
            <div className="px-4 py-3 bg-zinc-900/50">
              <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/60">CLAUDE.md - el motor de tu segundo cerebro</p>
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="rounded-lg overflow-hidden border border-green-500/10 image-frame">
              <ZoomableImage
                src="/segundo-cerebro/estrutura-do-vault.webp"
                alt="Panel lateral de Obsidian, estructura de carpetas"
                width={935}
                height={591}
                className="w-full h-auto"
              />
              <div className="px-4 py-3 bg-zinc-900/50">
                <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/60">Estructura de archivos</p>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border border-green-500/10 image-frame">
              <div className="aspect-[935/591] overflow-hidden relative">
                <ZoomableImage
                  src="/segundo-cerebro/about-me.webp"
                  alt="Plantilla about-me.md, preguntas para personalizar tu perfil"
                  width={716}
                  height={1763}
                  className="w-full h-auto"
                >
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0f0d] to-transparent pointer-events-none" />
                </ZoomableImage>
              </div>
              <div className="px-4 py-3 bg-zinc-900/50">
                <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/60">Plantilla about-me.md</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5 mb-12" />


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className={`glass p-6 card-hover ${
                card.highlight
                  ? "border-green-500/15 bg-gradient-to-br from-white/5 to-green-500/[0.03]"
                  : ""
              }`}
            >
              <h3 className={`font-mono text-sm font-bold mb-2 ${card.highlight ? "text-green-400" : "text-green-400/70"}`}>
                {card.highlight && "* "}
                {card.title}
              </h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}


function AudienceSection() {
  const PROFILES: { icon: React.ReactNode; title: string; desc: string }[] = [
    { icon: <Code2 className="h-5 w-5 text-green-400" />, title: "Desarrolladores", desc: "Gestiona ciclos de trabajo, documenta decisiones técnicas y guarda lo aprendido al resolver errores. Usa daily-briefing como tu reunión diaria personal. Renombra _pipeline/ a _projects/ y adáptalo a tu flujo." },
    { icon: <Target className="h-5 w-5 text-green-400" />, title: "Profesionales independientes y agencias", desc: "Seguimiento de clientes, investigación de contactos, propuestas y próximos pasos. El módulo de negocio reúne el contexto comercial para que Claude te ayude sin perder de vista cada oportunidad." },
    { icon: <BookOpen className="h-5 w-5 text-green-400" />, title: "Estudiantes e investigadores", desc: "Organiza tu trabajo de fin de carrera, tesis y proyectos de investigación. Captura ideas con braindump, guarda referencias y sigue tus avances. Usa weekly-review para orientar tu semana de estudio." },
    { icon: <Video className="h-5 w-5 text-green-400" />, title: "Creadores de contenido", desc: "Calendario editorial, ideas, posicionamiento y tono de voz. /content-idea propone contenido a partir de tus publicaciones anteriores y tus objetivos." },
    { icon: <BarChart3 className="h-5 w-5 text-green-400" />, title: "Responsables de equipo", desc: "Sigue los proyectos del equipo, guarda decisiones estratégicas y revisa las prioridades de la semana. Tu base de archivos se convierte en una memoria de gestión." },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
          Para ti, si ya usas{" "}
          <span className="font-punch text-gradient-green">Claude Code</span>
        </h2>
        <p className="text-[15px] text-zinc-400 leading-relaxed mb-10">
          El kit es modular. Incluye una base universal y un módulo de negocio opcional. Usa lo que encaje con tu trabajo y adapta el resto.
        </p>

        <div className="space-y-4">
          {PROFILES.map((profile) => (
            <div
              key={profile.title}
              className="glass p-6 flex items-start gap-4 card-hover"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center">{profile.icon}</span>
              <div>
                <h3 className="font-heading text-[15px] font-bold text-white mb-1">
                  {profile.title}
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  {profile.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}


function NotForSection({ pricing }: { pricing: Pricing }) {
  const WARNINGS = [
    { title: "No tienes Claude Code.", desc: "Necesitas tener Claude Code funcionando en tu computadora. Sin él, los comandos del kit no se ejecutan." },
    { title: "Buscas resultados sin configurarlo.", desc: "Recibes las plantillas y las guías. Tú tienes que añadir TUS datos. Reserva entre 30 y 60 minutos para la configuración inicial. Esa parte requiere tu atención." },
    { title: "Esperas un curso en video.", desc: "Recibes un sistema con guías escritas y soporte con IA. El formato va directo a la configuración y al uso, sin un curso de 10 horas de video." },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
          Antes de decidir, este kit{" "}
          <strong>no es</strong>{" "}
          para todo el mundo
        </h2>
        <p className="text-[15px] text-zinc-400 leading-relaxed mb-10">
          Prefiero que lo sepas antes de comprar. Si te identificas con alguno de estos puntos, el kit no encaja contigo:
        </p>

        <div className="space-y-4">
          {WARNINGS.map((warning) => (
            <div
              key={warning.title}
              className="glass border-amber-500/10 p-6 flex items-start gap-4"
            >
              <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center">
                <span className="text-amber-400 text-xs font-bold">⚠</span>
              </span>
              <div>
                <h3 className="font-heading text-[15px] font-bold text-white mb-1">
                  {warning.title}
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  {warning.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-base sm:text-lg text-zinc-400 text-center font-medium">
          Si tienes Claude Code y quieres configurarlo, sigue leyendo. Esto es lo que recibes por <span className="text-gradient-green font-semibold">{pricing.kit}.</span>
        </p>
        <SectionCta />
      </div>
    </section>
    </>
  );
}


function ValueComparisonSection({ pricing, currency }: { pricing: Pricing; currency: Currency }) {
  const COMPARISONS = [
    { price: pricing.claudeProMonth, label: "Claude Pro", duration: "suscripción mensual", highlight: false },
    { price: pricing.kit, label: "Kit Segundo Cerebro", duration: "un solo pago", highlight: true },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
          Tu Kit por{" "}
          <span className="font-punch text-gradient-green">{pricing.kit}</span>, una sola vez.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {COMPARISONS.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg p-6 text-center transition-all ${
                item.highlight
                  ? "border-2 border-green-500/40 bg-green-500/[0.06] green-glow-sm"
                  : "glass"
              }`}
            >
              <div className={`font-punch text-2xl font-extrabold mb-1 ${item.highlight ? "text-gradient-green" : "text-zinc-300"}`}>
                {item.price}
              </div>
              <div className={`text-sm font-semibold mb-2 ${item.highlight ? "text-white" : "text-zinc-400"}`}>
                {item.label}
              </div>
              <div className={`font-mono text-[11px] uppercase tracking-widest ${item.highlight ? "text-green-300" : "text-zinc-600"}`}>
                {item.duration}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Claude Pro es una suscripción mensual. El Kit es una compra de una sola vez. Son productos distintos: el Kit organiza tu contexto y necesita tu acceso a Claude Code por separado.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Tu segundo cerebro <strong className="text-gradient-green font-semibold">acumula contexto cada vez que lo usas.</strong> Guarda conocimientos, registra decisiones y reúne aprendizajes. Dentro de 6 meses podrás consultar un historial de tu trabajo que hoy todavía no tienes.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            {currency === "usd" ? (
              <>Como referencia, Claude Pro cuesta {pricing.claudeProMonth} al mes en EE. UU. Los precios y los impuestos pueden variar según la región.</>
            ) : (
              <>Como referencia, piensa en un mes de Claude Pro. Su precio local puede variar según la región y los impuestos.</>
            )}{" "}
            <a href="https://support.claude.com/en/articles/8325606-what-is-the-pro-plan" target="_blank" rel="noopener noreferrer" className="text-green-400 underline">Consulta la tarifa de Claude Pro.</a>
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            El Kit cuesta {pricing.kit}, en un solo pago. Lo configuras con tus datos y sigues usando los archivos, sin una cuota mensual del kit. <strong className="text-white">Tiempo para avanzar en lo que te importa, sin repetir el mismo contexto a la IA.</strong>
          </p>
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}


function SCFAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full py-6 flex items-start gap-3 text-left cursor-pointer group">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-zinc-300 text-[13px] font-bold group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors duration-200">?</span>
        <h3 className="font-heading text-[15px] font-semibold text-white leading-snug flex-1 group-hover:text-green-300 transition-colors duration-200">{q}</h3>
        <ChevronDown className={`h-4 w-4 text-zinc-500 flex-shrink-0 mt-0.5 transition-transform duration-300 ${open ? "rotate-180 text-green-400" : ""}`} />
      </button>
      <div className={`faq-answer ${open ? "open" : ""}`}>
        <div><p className="text-sm text-zinc-400 leading-relaxed pl-9 pb-6">{a}</p></div>
      </div>
    </div>
  );
}


function FAQSection() {
  const QUESTIONS = [
    {
      q: "\"Puedo hacerlo por mi cuenta.\"",
      a: "Crear carpetas es sencillo. Ajustar CLAUDE.md, las protecciones, la lógica de memoria y 8 comandos con condiciones encadenadas lleva más trabajo. El kit reúne semanas de ajustes en archivos que puedes usar como punto de partida.",
    },
    {
      q: "¿Qué acceso a Claude necesito?",
      a: "Necesitas acceso a Claude Code, mediante un plan compatible o la API. El kit no requiere funciones especiales. Si ya usas Claude Code, tienes la herramienta necesaria. Ese acceso se contrata por separado.",
    },
    {
      q: "¿Me sirve aunque no tenga una empresa?",
      a: "El kit es modular. La base universal incluye daily-briefing, end-session, braindump, weekly-review y plantillas de identidad, objetivos y proyectos. El módulo de negocio es opcional. Puedes usarlo o eliminarlo. Hay ejemplos para desarrollo, estudios, creación de contenido, gestión y trabajo independiente.",
    },
    {
      q: "¿Qué pasa si Claude Code cambia?",
      a: "El kit utiliza archivos Markdown que puedes leer y editar. Tu información queda en archivos de texto, sin un formato propietario. Si Claude Code cambia la forma de ejecutar instrucciones o comandos, puede ser necesario ajustarlos.",
    },
    {
      q: "\"¿Pagar por archivos .md?\"",
      a: "Un libro puede cambiar tu forma de trabajar aunque esté hecho de texto. Aquí pagas por las semanas de ajustes reunidas en las instrucciones, la lógica de los comandos y las protecciones. Por tener un punto de partida preparado y ahorrarte parte del trabajo de construirlo desde cero.",
    },
    {
      q: "¿Y si me atasco al configurarlo?",
      a: "Tienes una guía de instalación paso a paso, ejemplos de personalización y 4 instrucciones de configuración. También hay instrucciones de soporte para pegar en un chat con IA y consultar dudas sobre el kit a cualquier hora. Si sigues sin avanzar, escríbeme por mensaje directo.",
    },
  ];

  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section id="faq" className="py-20 sm:py-28">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight mb-10">
          Preguntas que quizá
          <br />
          <span className="font-punch text-gradient-green">te estás haciendo.</span>
        </h2>

        <div>
          {QUESTIONS.map((item) => (
            <SCFAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
        <SectionCta />
      </div>
    </section>
    </>
  );
}


function SupportSection({ pricing }: { pricing: Pricing }) {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6">
          Compra una vez. Consulta tus dudas{" "}
          <span className="font-punch text-gradient-green">cuando lo necesites.</span>
        </h2>

        <p className="text-[15px] text-zinc-400 leading-relaxed mb-8">
          El soporte del kit funciona con IA. Puedes consultarlo cuando lo necesites.
        </p>


        <div className="rounded-lg border border-green-500/20 bg-green-500/[0.06] p-8 mb-8">
          <h3 className="font-heading text-xl font-bold text-white mb-4">
            Soporte con IA sin límite de consultas
          </h3>
          <p className="text-[15px] text-zinc-400 leading-relaxed mb-3">
            El kit incluye el archivo <strong className="text-white">prompt-suporte-llm.md</strong>. Copia el contenido, pégalo en un chat nuevo de Claude o ChatGPT y tendrás un asistente con el contexto del kit.
          </p>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Te orienta con la instalación, la personalización, los errores y la creación de comandos. También te ayuda a modificar el sistema. <strong className="text-gradient-green font-semibold">Disponible las 24 horas. Sin colas. Sin solicitudes de soporte. Sin fecha de caducidad.</strong>
          </p>
        </div>

        <p className="text-[15px] text-zinc-400 leading-relaxed">
          Por {pricing.kit} recibes el kit y las instrucciones de soporte con IA para seguir consultándolas. El kit no añade una cuota <em>mensual</em> por ese soporte.
        </p>
        <SectionCta />
      </div>
    </section>
    </>
  );
}


function PricingSection({ pricing, checkoutUrl }: { pricing: Pricing; checkoutUrl: string }) {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section id="comprar" className="py-24 sm:py-32 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-green-500/[0.04] blur-[150px] pointer-events-none" />

      <div ref={ref} className="scroll-reveal relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          ¿Listo para crear el tuyo?
        </h2>

        <div className="space-y-4 text-[15px] text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10">
          <p>
            Ya he vendido esta configuración como un servicio hecho por mí por un importe mucho mayor. Un curso o una suscripción con soporte serían ofertas distintas.
          </p>
          <p>
            Aquí recibes el kit para hacerlo tú. Descarga los archivos, personalízalos y empieza a usarlos. Un solo pago.
          </p>
        </div>


        <div className="mx-auto max-w-sm rounded-lg border-2 border-green-500/40 bg-green-500/[0.06] p-8 mb-6">
          <div className="font-punch text-5xl sm:text-6xl font-extrabold text-gradient-green mb-2">{pricing.kit}</div>
          <p className="text-sm text-green-300/70 mb-6">
            Un solo pago. Sin suscripción. Sin renovación.
          </p>
          <a
            href={checkoutUrl}
            className="group block w-full rounded-lg bg-green-500 px-8 py-4 text-lg font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer"
          >
            Quiero el Kit Segundo Cerebro <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">&rarr;</span>
          </a>
          <p className="font-mono text-[11px] text-zinc-500 mt-4">
            Pago seguro con Hotmart &middot; Entrega digital &middot; Acceso inmediato
          </p>
        </div>

        <p className="font-mono text-[12px] text-zinc-600 leading-relaxed">
          CLAUDE.md preparado &middot; 8 comandos &middot; 4 instrucciones de configuración &middot; 9 plantillas &middot; Guías completas &middot; Soporte con IA incluido
        </p>
      </div>
    </section>
    </>
  );
}


function FinalPushSection({ pricing, checkoutUrl }: { pricing: Pricing; checkoutUrl: string }) {
  const ref = useScrollReveal();
  return (
    <>
    <div className="section-divider" />
    <section className="py-20 sm:py-28 bg-black/80">
      <div ref={ref} className="scroll-reveal mx-auto max-w-2xl px-4 sm:px-6">
        <div className="space-y-6 text-base sm:text-lg text-zinc-400 leading-relaxed">
          <p>Tienes dos opciones.</p>
          <p>
            Cerrar esta página y abrir Claude Code mañana. Escribir el párrafo de contexto de siempre. Recibir otra respuesta genérica. Repetirlo el martes, el miércoles, la semana que viene. Volver al principio con cada chat nuevo.
          </p>
          <p>
            O descargar el kit y reservar entre 30 y 60 minutos para configurar tu segundo cerebro con tus datos.
          </p>
          <p className="text-white font-bold">
            Después de configurarlo, puedes abrir Claude Code, escribir{" "}
            <code className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">/daily-briefing</code>{" "}
            y recibir un resumen personalizado de tu día. Con tu contexto guardado. Sin volver a empezar desde cero.
          </p>
          <p><span className="text-gradient-green font-semibold">Tu segundo cerebro tendrá el contexto preparado.</span></p>
        </div>

        <div className="mt-10 text-center">
          <a
            id={FINAL_CTA_ID}
            href={checkoutUrl}
            className="group inline-flex items-center gap-2 rounded-lg bg-green-500 px-10 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,232,76,0.3)] cursor-pointer green-glow"
          >
            Crear mi Segundo Cerebro - {pricing.kit} <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
          </a>
          <p className="mt-4 font-mono text-[12px] text-green-300/70">
            Un solo pago. Acceso de por vida. Actualizaciones incluidas.
          </p>
        </div>
      </div>
    </section>
    </>
  );
}


function SCFooter() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/lockup-sem-fundo.svg"
            alt="Infuser"
            width={100}
            height={28}
            className="h-7 w-auto"
          />
        </div>
        <p className="font-mono text-[11px] text-zinc-600 leading-relaxed">
          Kit Segundo Cerebro - por{" "}
          <a
            href="https://instagram.com/yangalasso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400/70 hover:text-green-300 transition-colors"
          >
            @yangalasso
          </a>
        </p>
        <p className="font-mono text-[11px] text-zinc-600 mt-1">
          Producto digital &middot; Entrega mediante Hotmart &middot; Sin suscripción
        </p>
      </div>
    </footer>
  );
}


export function SegundoCerebroEs() {
  const [currency, setCurrency] = useState<Currency>("usd");

  useEffect(() => {
    setCurrency(new URLSearchParams(window.location.search).get("moneda") === "eur" ? "eur" : "usd");
  }, []);

  const pricing = PRICING[currency];
  const checkoutUrl = CHECKOUT_URL[currency];

  return (
    <div lang="es">
      <main>
        <HeroSection />
        <PainSection />
        <RevelationSection />
        <DemoSection />
        <KitContentsSection />
        <AudienceSection />
        <NotForSection pricing={pricing} />
        <ValueComparisonSection pricing={pricing} currency={currency} />
        <FAQSection />
        <SupportSection pricing={pricing} />
        <PricingSection pricing={pricing} checkoutUrl={checkoutUrl} />
        <FinalPushSection pricing={pricing} checkoutUrl={checkoutUrl} />
      </main>
      <SocialProofToast />
      <SCFooter />
    </div>
  );
}
