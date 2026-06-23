"use client";

import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  Users,
  GraduationCap,
  Layers,
  Radio,
  Trophy,
  Download,
  Eye,
  Tag,
  Zap,
} from "lucide-react";
import {
  HoverExpand,
  type HoverExpandItem,
} from "@/components/unlumen-ui/hover-expand";
import ScrollableCardStack, {
  type CardItem,
} from "@/components/smoothui/scrollable-card-stack";
import { clubHtml } from "@/app/club/club-html";

const ICON = "h-6 w-6";

// 9 entregáveis (mesma copy da página viva; #5 corrigido pra quinzenal).
const ENTREGAVEIS: HoverExpandItem[] = [
  {
    label: "A comunidade onde a conversa certa acontece",
    sublabel: "Discord · WhatsApp · Telegram",
    description:
      "Três canais (Discord, WhatsApp e Telegram) pra você ficar plugado onde estiver. Não é grupo de curiosidade: é onde as conversas que movem inteligência e dinheiro acontecem em tempo real, com gente que está construindo de verdade.",
    icon: <Users className={ICON} />,
  },
  {
    label: "Curso Claude do Zero",
    sublabel: "vale R$297/ano · incluso",
    description:
      "As 6 frentes que ninguém te ensina: Cowork, Chat, Code, Projetos, MCP e Skills. A diferença entre usar 10% do que o Claude é capaz e operar com ele de verdade. E nunca envelhece: toda semana o Yan filtra as novidades que importam numa aula ao vivo que entra na área de membros.",
    icon: <GraduationCap className={ICON} />,
  },
  {
    label: "Módulo avançado: Claude como sistema operacional",
    sublabel: "vale R$497/ano · incluso",
    description:
      "O próximo degrau. Conectar as 6 frentes pra automatizar processos e montar operações que rodam sem você no meio de tudo. O mesmo sistema que o Yan constrói e vende pra empresas por R$10.000+, você aprende a montar o seu.",
    icon: <Layers className={ICON} />,
  },
  {
    label: "Calibração semanal ao vivo",
    sublabel: "call toda semana",
    description:
      "Toda semana, uma call com quem tem operação rodando. Você leva a dúvida, mostra onde travou e sai com a direção certa. A diferença entre passar seis meses remando errado e corrigir o rumo toda semana.",
    icon: <Radio className={ICON} />,
  },
  {
    label: "A ponte do aprendi pro lucrei",
    sublabel: "desafio quinzenal",
    description:
      "A cada 15 dias, um desafio: você desenvolve um produto com IA e os melhores a Infuser vende em parceria com quem criou, você lucra junto. Some pontos vencendo, interagindo e ajudando outros membros, e quem cresce na pontuação entra no radar pra ser contratado pro time. Só isso já paga o Club.",
    icon: <Trophy className={ICON} />,
  },
  {
    label: "Website Downloader",
    sublabel: "vale R$57/mês · incluso",
    description:
      "Aponte pra qualquer site e ele baixa a página inteira: layout, textos, imagens, fontes e até as animações. O que levaria horas copiando na mão sai em segundos. Sozinho custa R$57/mês por fora; aqui já vem incluso.",
    icon: <Download className={ICON} />,
  },
  {
    label: "Por cima do ombro de quem fatura",
    sublabel: "bastidores",
    description:
      "Yan mostrando o que está funcionando pra ganhar dinheiro com IA agora. Não o que funcionava mês passado: o que funcionou essa semana, com cliente real e entrega real.",
    icon: <Eye className={ICON} />,
  },
  {
    label: "Preço de membro, não de visitante",
    sublabel: "desconto Infuser",
    description:
      "Desconto em todos os produtos da Infuser. A assinatura começa a se pagar sozinha, e o que você economiza num lançamento já cobre meses de Club.",
    icon: <Tag className={ICON} />,
  },
  {
    label: "Chegar primeiro",
    sublabel: "novidades em tempo real",
    description:
      "A distância entre saber de uma ferramenta no dia que ela nasce e descobrir três meses depois é a mesma distância entre lucrar e ficar pra trás. Você fica na frente da fila enquanto o mercado ainda está reagindo.",
    icon: <Zap className={ICON} />,
  },
];

// 4 bônus — adicionado O Pergaminho (perk do Club, decisão Yan 22/06).
const BONUSES: CardItem[] = [
  {
    id: "jarvis",
    image: "/capa-jarvis.webp",
    title: "Kit JARVIS",
    subtitle: "Automação por palmas e voz. Bate palma, o computador executa.",
    value: "R$19,90",
    tag: "Bônus 01",
    href: "/kit-jarvis",
  },
  {
    id: "segundo-cerebro",
    image: "/capa-segundo-cerebro.webp",
    title: "Kit Segundo Cérebro",
    subtitle: "Memória permanente pro Claude. Ele lembra tudo que você fez.",
    value: "R$67",
    tag: "Bônus 02",
    href: "/kit-segundo-cerebro",
  },
  {
    id: "skills",
    image: "/capa-kit-skills.webp",
    title: "Pack de Skills",
    subtitle: "Skills que viram o Claude numa máquina de execução sob medida.",
    value: "R$29,90",
    tag: "Bônus 03",
    href: "/kit-skills",
  },
  {
    id: "pergaminho",
    image: "/club/o-pergaminho.png",
    title: "O Pergaminho",
    subtitle:
      "Do zero à sua ideia de negócio validada, em 1 documento, guiado pela IA.",
    value: "R$37",
    tag: "Bônus 04",
    accent: "#E8C24C",
  },
];

export function ClubPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = containerRef.current;
    const roots: Root[] = [];
    if (scope) {
      const e = scope.querySelector("#club-entregaveis-mount");
      const b = scope.querySelector("#club-bonus-mount");
      if (e) {
        const r = createRoot(e);
        r.render(<HoverExpand items={ENTREGAVEIS} expandedHeight={360} />);
        roots.push(r);
      }
      if (b) {
        const r = createRoot(b);
        r.render(
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <ScrollableCardStack items={BONUSES} cardHeight={480} cardWidth={480} />
          </div>
        );
        roots.push(r);
      }
    }

    // a página antiga gateia o reveal atrás de .js (.js .rv{opacity:0})
    const root = document.documentElement;
    root.classList.add("js");

    // navbar scrolled state
    const nav = document.getElementById("nav");
    const onScroll = () =>
      nav?.classList.toggle("scrolled", window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // footer year
    const year = document.getElementById("year");
    if (year) year.textContent = "© " + new Date().getFullYear();

    // reveal on scroll (porte do script inline da página antiga)
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const rv = document.querySelectorAll(".rv");
    let io: IntersectionObserver | undefined;
    if (reduce || !("IntersectionObserver" in window)) {
      rv.forEach((el) => el.classList.add("in"));
    } else {
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((x) => {
            if (x.isIntersecting) {
              x.target.classList.add("in");
              io!.unobserve(x.target);
            }
          }),
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      rv.forEach((el) => io!.observe(el));
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
      root.classList.remove("js");
      roots.forEach((r) => r.unmount());
    };
  }, []);

  // Página antiga (HTML/CSS reais de club.useinfuser.com) com correções de copy.
  // Os 2 componentes React são montados (createRoot) nos pontos #club-*-mount via efeito acima.
  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: clubHtml }} />
  );
}
