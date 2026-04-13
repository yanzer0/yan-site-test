"use client";

import { FallingPattern } from "@/components/ui/falling-pattern";
import { SegundoCerebro } from "@/components/segundo-cerebro";

export function KitSegundoCerebroPage() {
  return (
    <>
      {/* Full-page background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FallingPattern
          className="h-full"
          color="#A8E84C"
          backgroundColor="#000000"
          duration={80}
          blurIntensity="0.4rem"
          density={2}
        />
      </div>
      <div className="relative z-10">
        <SegundoCerebro />
      </div>
    </>
  );
}
