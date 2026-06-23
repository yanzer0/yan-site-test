"use client";

// Source: Unlumen UI — "hover-expand" (registry: https://ui.unlumen.com/r/hover-expand.json)
// Mechanics preserved (spring height + dim siblings). Adapted for this project: import from
// "framer-motion", and the imageless branch extended into a RICH reveal (icon + title +
// full description) so feature lists read fully on hover instead of truncating.

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface HoverExpandItem {
  label: string;
  /** e.g. price/tag, shown as an uppercase eyebrow */
  sublabel?: string;
  /** Optional image. When omitted, a branded gradient reveal is shown. */
  image?: string;
  imageAlt?: string;
  /** full descriptor, shown as a paragraph when expanded */
  description?: string;
  /** Accent color for the imageless reveal. @default "#A8E84C" */
  accent?: string;
  /** Optional icon rendered on the imageless reveal. */
  icon?: React.ReactNode;
}

export interface HoverExpandProps {
  items: HoverExpandItem[];
  /** Row height when collapsed, in pixels. @default 72 */
  collapsedHeight?: number;
  /** Row height when expanded, in pixels. @default 340 */
  expandedHeight?: number;
  className?: string;
}

export function HoverExpand({
  items,
  collapsedHeight = 72,
  expandedHeight = 340,
  className,
}: HoverExpandProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="w-full border-t border-current opacity-15" />

      {items.map((item, i) => {
        const isHovered = hoveredIndex === i;
        const isOtherHovered = hoveredIndex !== null && !isHovered;
        const accent = item.accent ?? "#A8E84C";
        const rich = !item.image;
        const nn = String(i + 1).padStart(2, "0");

        return (
          <React.Fragment key={i}>
            <motion.div
              className="relative w-full overflow-hidden cursor-default"
              animate={{
                height: isHovered ? expandedHeight : collapsedHeight,
                opacity: isOtherHovered ? 0.4 : 1,
              }}
              transition={{
                height: { type: "spring", stiffness: 280, damping: 32, mass: 0.9 },
                opacity: { duration: 0.22, ease: "easeOut" },
              }}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              {/* reveal layer */}
              <motion.div
                className="absolute inset-0 w-full h-full"
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 1.04 }}
                transition={{
                  opacity: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                  scale: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
                }}
              >
                {item.image ? (
                  <>
                    <img
                      src={item.image}
                      alt={item.imageAlt ?? ""}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                  </>
                ) : (
                  <div
                    className="relative w-full h-full"
                    style={{
                      background: `radial-gradient(130% 150% at 100% 0%, ${accent}22 0%, transparent 55%), linear-gradient(115deg, #0c1108 0%, #05070a 72%)`,
                    }}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-5 -bottom-4 font-punch leading-none opacity-[0.07]"
                      style={{ color: accent, fontSize: "12rem" }}
                    >
                      {nn}
                    </span>
                    <div
                      className="absolute inset-0 flex flex-col justify-center gap-3"
                      style={{
                        paddingLeft: "clamp(1.5rem, 6vw, 4.5rem)",
                        paddingRight: "clamp(1.5rem, 6vw, 4.5rem)",
                        paddingBottom: "3.5rem",
                      }}
                    >
                      <div
                        className="flex items-center gap-3"
                        style={{ color: accent }}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        {item.sublabel && (
                          <span className="font-mono text-[11px] uppercase tracking-[0.15em]">
                            {item.sublabel}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                        {item.label}
                      </h3>
                      {item.description && (
                        <p className="max-w-2xl text-[13.5px] sm:text-[15px] leading-relaxed text-white/75">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* collapsed row bar */}
              <div
                className="absolute inset-0 flex items-end pointer-events-none"
                style={{
                  paddingLeft: "clamp(1.5rem, 6vw, 4.5rem)",
                  paddingRight: "clamp(1.5rem, 6vw, 4.5rem)",
                  paddingBottom: "1rem",
                }}
              >
                <div className="flex w-full items-end justify-between gap-4">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="text-xs tabular-nums shrink-0 opacity-40">
                      {nn}
                    </span>
                    <motion.span
                      className="font-semibold tracking-tight truncate"
                      style={{ fontSize: "clamp(1.05rem, 2vw, 1.4rem)" }}
                      animate={{ opacity: rich && isHovered ? 0 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  </div>

                  {item.sublabel && (
                    <motion.span
                      className="text-[11px] tracking-widest uppercase shrink-0"
                      animate={{ opacity: rich && isHovered ? 0 : 0.45 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.sublabel}
                    </motion.span>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="w-full border-t border-current opacity-15" />
          </React.Fragment>
        );
      })}
    </div>
  );
}
