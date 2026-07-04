import ScrollRevealText from "@/components/scroll-reveal-text";

// Pagina de TESTE temporaria: as 12 opcoes (presets) do ScrollRevealText.
const PRESETS = [
  "Default",
  "Fade In Up",
  "Blur Reveal",
  "Cinematic",
  "3D Flip",
  "Wave RTL",
  "Typewriter",
  "Glitch Rise",
  "Soft Words",
  "Cascade Down",
  "Masked Lines",
  "Scale Pop",
];

const SAMPLE = "As maiores mentes de copy, tráfego e vendas trabalhando por você.";

export default function TextRevealTestPage() {
  return (
    <main
      style={{
        background: "#0a0a0b",
        minHeight: "100dvh",
        padding: "18vh 8vw 44vh",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <p
        style={{
          fontFamily: "monospace",
          fontSize: 13,
          color: "#6b7280",
          marginBottom: "14vh",
          letterSpacing: "0.02em",
        }}
      >
        Scroll pra baixo — cada preset revela ao entrar na tela. 12 opções.
      </p>

      {PRESETS.map((preset) => (
        <section key={preset} style={{ marginBottom: "26vh" }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#4b5563",
              letterSpacing: "0.14em",
              marginBottom: 18,
            }}
          >
            {preset.toUpperCase()}
          </div>
          <ScrollRevealText
            preset={preset}
            text={SAMPLE}
            font={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 46,
              lineHeight: "1.28em",
              letterSpacing: "-0.02em",
            }}
            colorHidden="#33332f"
            colorRevealed="#F0F0E4"
          />
        </section>
      ))}
    </main>
  );
}
