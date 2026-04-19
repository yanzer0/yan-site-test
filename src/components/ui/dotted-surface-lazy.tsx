"use client";

import dynamic from "next/dynamic";

export const DottedSurface = dynamic(
  () => import("./dotted-surface").then((m) => ({ default: m.DottedSurface })),
  { ssr: false, loading: () => null }
);
