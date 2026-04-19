"use client";

import dynamic from "next/dynamic";

export const FallingPattern = dynamic(
  () => import("./falling-pattern").then((m) => ({ default: m.FallingPattern })),
  { ssr: false, loading: () => null }
);
