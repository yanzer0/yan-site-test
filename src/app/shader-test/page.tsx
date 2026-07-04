import PremiumShaderButton from "@/components/premium-shader-button";

// Pagina de TESTE temporaria pra validar o PremiumShaderButton rodando fora do Framer.
// Apagar depois do OK (o componente em src/components fica).
export default function ShaderTestPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        background: "#070707",
      }}
    >
      <div style={{ width: 300, height: 66 }}>
        <PremiumShaderButton
          text="Começar agora"
          textFont={{ fontSize: "20px", fontWeight: 600, letterSpacing: "0.01em" }}
          padding="20px 44px"
          baseColor="#000000"
          glassColor="#C6FF34"
          hoverSpeed={0.6}
          borderRadius={999}
          livePreview={true}
        />
      </div>
      <div style={{ width: 240, height: 60 }}>
        <PremiumShaderButton
          text="Entrar"
          textFont={{ fontSize: "18px", fontWeight: 600 }}
          padding="18px 40px"
          baseColor="#0A0A0A"
          glassColor="#3BD0A0"
          hoverSpeed={0.9}
          borderRadius={16}
          livePreview={true}
        />
      </div>
    </main>
  );
}
