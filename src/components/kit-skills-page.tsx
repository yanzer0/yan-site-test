"use client";

import { FallingPattern } from "@/components/ui/falling-pattern";
import { KitSkills } from "@/components/kit-skills";

export function KitSkillsPage() {
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
        <KitSkills />
      </div>
    </>
  );
}
