import ProgressiveSmearCarousel from "@/components/progressive-smear-carousel";

// Pagina de TESTE temporaria pra validar o ProgressiveSmearCarousel fora do Framer.
// Apagar depois do OK (o componente em src/components fica).
export default function CarouselTestPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 0",
        background: "#070707",
      }}
    >
      <div style={{ width: "min(1100px, 96vw)", height: 500 }}>
        <ProgressiveSmearCarousel />
      </div>
    </main>
  );
}
