import ProgressiveSmearCarousel from "@/components/progressive-smear-carousel";
import { AGENTS } from "./esquadrao-agents";

// Pagina de TESTE temporaria: os 80 agentes do Esquadrao no carrossel 3D.
export default function EsquadraoTestPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "40px 0",
        background: "#070707",
        color: "#fff",
      }}
    >
      <div style={{ textAlign: "center", padding: "0 20px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
          Esquadrão · 80 agentes
        </h1>
        <p style={{ opacity: 0.55, fontSize: 13, marginTop: 6 }}>
          arrasta ou scrolla em cima do carrossel pra girar
        </p>
      </div>

      <div style={{ width: "min(1300px, 98vw)", height: 560 }}>
        <ProgressiveSmearCarousel
          items={AGENTS}
          layoutProps={{
            itemWidth: 440,
            itemHeight: 440,
            sideItemWidth: 300,
            sideItemHeight: 300,
            gap: 56,
          }}
        />
      </div>
    </main>
  );
}
