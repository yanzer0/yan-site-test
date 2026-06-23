"use client";

// Source: SmoothUI — "scrollable-card-stack" by Eduardo Calvo
// (registry: https://smoothui.dev/r/scrollable-card-stack.json)
// The interaction mechanics (scroll-snap, perspective transforms, blur depth, touch +
// keyboard nav, indicators, reduced-motion) are preserved verbatim. Adapted for this
// project: import from "framer-motion" instead of "motion/react", cn from "@/lib/utils",
// and the per-card CONTENT generalized from a social profile card to a reusable
// image/title/value card (used here for the Club bonus stack).

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_TIMEOUT_OFFSET = 100;
const MIN_SCROLL_INTERVAL = 300;
const SCROLL_THRESHOLD = 20;
const TOUCH_SCROLL_THRESHOLD = 100;
const SCALE_FACTOR = 0.08;
const MIN_SCALE = 0.08;
const MAX_SCALE = 2;
const HOVER_SCALE_MULTIPLIER = 1.02;
const CARD_PADDING = 100;

export interface CardItem {
  id: string;
  /** Cover image. When omitted, a branded gradient cover (see `accent`) is shown. */
  image?: string;
  title: string;
  subtitle?: string;
  /** e.g. a price or value badge shown in the footer. */
  value?: string;
  /** small uppercase tag, e.g. "Incluso". */
  tag?: string;
  href?: string;
  /** Accent color for the imageless gradient cover. @default "#A8E84C" */
  accent?: string;
}

export interface ScrollableCardStackProps {
  cardHeight?: number;
  cardWidth?: number;
  className?: string;
  items: CardItem[];
  perspective?: number;
  transitionDuration?: number;
}

const ScrollableCardStack: React.FC<ScrollableCardStackProps> = ({
  items,
  cardHeight = 384,
  cardWidth = 400,
  perspective = 1000,
  transitionDuration = 180,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollY = useMotionValue(0);
  const lastScrollTime = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  // Calculate the total number of items
  const totalItems = items.length;
  const maxIndex = totalItems - 1;

  // Constants for visual effects - matching reference code exactly
  const FRAME_OFFSET = -30;
  const FRAMES_VISIBLE_LENGTH = 3;
  const SNAP_DISTANCE = 50;

  // Clamp function from reference code - memoized to prevent recreation
  const clamp = useCallback(
    (val: number, [min, max]: [number, number]): number =>
      Math.min(Math.max(val, min), max),
    []
  );

  // Controlled scroll function to move exactly one card
  const scrollToCard = useCallback(
    (direction: 1 | -1) => {
      if (isScrolling) {
        return;
      }

      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;

      if (timeSinceLastScroll < MIN_SCROLL_INTERVAL) {
        return;
      }

      const newIndex = clamp(currentIndex + direction, [0, maxIndex]);

      if (newIndex !== currentIndex) {
        lastScrollTime.current = now;
        setIsScrolling(true);
        setCurrentIndex(newIndex);
        scrollY.set(newIndex * SNAP_DISTANCE);

        setTimeout(() => {
          setIsScrolling(false);
        }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
      }
    },
    [currentIndex, maxIndex, scrollY, isScrolling, transitionDuration, clamp]
  );

  // Handle scroll events with improved responsiveness
  const handleScroll = useCallback(
    (deltaY: number) => {
      if (isDragging || isScrolling) {
        return;
      }

      if (Math.abs(deltaY) < SCROLL_THRESHOLD) {
        return;
      }

      const scrollDirection = deltaY > 0 ? 1 : -1;
      scrollToCard(scrollDirection);
    },
    [isDragging, isScrolling, scrollToCard]
  );

  // Handle wheel events
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      handleScroll(e.deltaY);
    },
    [handleScroll]
  );

  // Handle keyboard navigation - improved with reference code logic
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isScrolling) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "ArrowLeft": {
          e.preventDefault();
          scrollToCard(-1);
          break;
        }
        case "ArrowDown":
        case "ArrowRight": {
          e.preventDefault();
          scrollToCard(1);
          break;
        }
        case "Home": {
          e.preventDefault();
          if (currentIndex !== 0) {
            setIsScrolling(true);
            setCurrentIndex(0);
            scrollY.set(0);
            setTimeout(() => {
              setIsScrolling(false);
            }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
          }
          break;
        }
        case "End": {
          e.preventDefault();
          if (currentIndex !== maxIndex) {
            setIsScrolling(true);
            setCurrentIndex(maxIndex);
            scrollY.set(maxIndex * SNAP_DISTANCE);
            setTimeout(() => {
              setIsScrolling(false);
            }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
          }
          break;
        }
        default: {
          // No action for other keys
          break;
        }
      }
    },
    [
      currentIndex,
      maxIndex,
      scrollY,
      isScrolling,
      scrollToCard,
      transitionDuration,
    ]
  );

  // Handle touch events for mobile
  const touchStartY = useRef(0);
  const touchStartIndex = useRef(0);
  const touchStartTime = useRef(0);
  const touchMoved = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartIndex.current = currentIndex;
      touchStartTime.current = Date.now();
      touchMoved.current = false;
      setIsDragging(true);
    },
    [currentIndex]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || isScrolling) {
        return;
      }

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchY;

      if (Math.abs(deltaY) > TOUCH_SCROLL_THRESHOLD && !touchMoved.current) {
        const scrollDirection = deltaY > 0 ? 1 : -1;
        scrollToCard(scrollDirection);
        touchMoved.current = true;
      }
    },
    [isDragging, isScrolling, scrollToCard]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    touchMoved.current = false;
  }, []);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // Snap to current index when not dragging
  useEffect(() => {
    if (!isDragging) {
      scrollY.set(currentIndex * SNAP_DISTANCE);
    }
  }, [currentIndex, isDragging, scrollY]);

  // Calculate transform for each card based on the reference code
  const getCardTransform = useCallback(
    (index: number) => {
      const offsetIndex = index - currentIndex;

      // Apply blur effect for cards behind the current one - matching reference exactly
      const isBehindCurrent = currentIndex > index;
      const blur = !shouldReduceMotion && isBehindCurrent ? 2 : 0;

      // Opacity based on distance - improved logic from reference
      const opacity = currentIndex > index ? 0 : 1;

      // Scale with improved calculation inspired by reference - using clamp function
      const scale = shouldReduceMotion
        ? 1
        : clamp(1 - offsetIndex * SCALE_FACTOR, [MIN_SCALE, MAX_SCALE]);

      // Vertical offset with improved calculation - matching reference exactly
      const y = shouldReduceMotion
        ? 0
        : clamp(offsetIndex * FRAME_OFFSET, [
            FRAME_OFFSET * FRAMES_VISIBLE_LENGTH,
            Number.POSITIVE_INFINITY,
          ]);

      // Z-index for proper layering - matching reference pattern
      const zIndex = items.length - index;

      return {
        y,
        scale,
        opacity,
        blur,
        zIndex,
      };
    },
    [currentIndex, items.length, clamp, shouldReduceMotion]
  );

  return (
    <section
      aria-atomic="true"
      aria-label="Scrollable card stack"
      aria-live="polite"
      className={cn("relative mx-auto h-fit", className)}
      style={{ width: cardWidth, maxWidth: "92vw" }}
    >
      <div
        aria-label="Scrollable card container"
        className="h-full w-full"
        onKeyDown={handleKeyDown}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        ref={containerRef}
        role="application"
        style={{
          minHeight: `${cardHeight + CARD_PADDING}px`, // Add some padding for the card stack effect
          perspective: `${perspective}px`,
          perspectiveOrigin: "center 60%",
          touchAction: "none",
        }}
        tabIndex={0}
      >
        {items.map((item, i) => {
          const transform = getCardTransform(i);
          const isActive = i === currentIndex;
          const isHovered = hoveredIndex === i;
          const accent = item.accent ?? "#A8E84C";

          return (
            <motion.div
              animate={
                shouldReduceMotion
                  ? { x: "-50%" }
                  : {
                      y: `calc(-50% + ${transform.y}px)`,
                      scale: transform.scale,
                      x: "-50%",
                    }
              }
              aria-hidden={!isActive}
              className="absolute top-1/2 left-1/2 w-max max-w-[100vw] overflow-hidden rounded-2xl border bg-background shadow-lg"
              data-active={isActive}
              initial={false}
              key={`scrollable-card-${item.id}`}
              onBlur={() => setHoveredIndex(null)}
              onFocus={() => isActive && setHoveredIndex(i)}
              onMouseEnter={() => isActive && setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                height: `${cardHeight}px`,
                zIndex: transform.zIndex,
                pointerEvents: isActive ? "auto" : "none",
                transformOrigin: "center center",
                willChange: shouldReduceMotion
                  ? undefined
                  : "opacity, filter, transform",
                filter: `blur(${transform.blur}px)`,
                opacity: transform.opacity,
                transitionProperty: shouldReduceMotion
                  ? "none"
                  : "opacity, filter",
                transitionDuration: shouldReduceMotion ? "0ms" : "200ms",
                transitionTimingFunction:
                  "cubic-bezier(0.645, 0.045, 0.355, 1)",
                // Dynamic border width based on scale - from reference code
                borderWidth: `${2 / transform.scale}px`,
              }}
              tabIndex={isActive ? 0 : -1}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      type: "spring" as const,
                      stiffness: 250,
                      damping: 20,
                      mass: 0.5,
                      duration: 0.25,
                    }
              }
              whileHover={
                shouldReduceMotion || !isActive
                  ? {}
                  : {
                      scale: transform.scale * HOVER_SCALE_MULTIPLIER,
                      transition: {
                        type: "spring" as const,
                        stiffness: 250,
                        damping: 20,
                        mass: 0.5,
                        duration: 0.25,
                      },
                    }
              }
            >
              {/* Card Content — generalized to an image/title/value card */}
              <div
                className={cn(
                  "flex w-full flex-col overflow-hidden rounded-xl bg-background transition-all duration-200",
                  isHovered && "shadow-xl",
                  isScrolling && isActive && "ring-2 ring-brand ring-opacity-50"
                )}
                style={{ height: `${cardHeight}px`, width: `${cardWidth}px`, maxWidth: "90vw" }}
              >
                {/* Scroll indicator */}
                {isScrolling && isActive && (
                  <div className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-brand opacity-75" />
                )}

                {/* Cover — takes remaining space; image contained com sobra */}
                <div className="relative w-full flex-1 overflow-hidden">
                  {item.image ? (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ padding: "22px" }}
                    >
                      <img
                        alt={item.title}
                        className="max-h-full max-w-full rounded-lg object-contain"
                        decoding="async"
                        draggable={false}
                        src={item.image}
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: `radial-gradient(120% 130% at 50% 0%, ${accent}24 0%, transparent 60%), linear-gradient(150deg, #11160b 0%, #07090c 80%)`,
                      }}
                    >
                      <span
                        className="font-punch text-5xl tracking-tight"
                        style={{ color: accent }}
                      >
                        {item.title}
                      </span>
                    </div>
                  )}
                  {item.tag && (
                    <span
                      className="absolute left-4 top-4 rounded-full border border-green-500/30 bg-black/60 font-mono text-[10px] uppercase tracking-widest text-green-300 backdrop-blur"
                      style={{ padding: "4px 11px" }}
                    >
                      {item.tag}
                    </span>
                  )}
                  {item.value && (
                    <span
                      className="absolute right-4 top-4 rounded-full bg-green-500 font-mono text-[11px] font-bold text-black"
                      style={{ padding: "4px 11px" }}
                    >
                      {item.value}
                    </span>
                  )}
                </div>

                {/* Footer — title + optional link, always at bottom */}
                <a
                  aria-label={item.href ? `Abrir ${item.title}` : item.title}
                  className="flex items-center justify-between gap-3 border-t border-white/10 bg-background/95 text-inherit no-underline backdrop-blur-sm transition-colors duration-200"
                  style={{ padding: "16px 22px" }}
                  href={item.href ?? undefined}
                  rel={item.href ? "noopener noreferrer" : undefined}
                  target={item.href ? "_blank" : undefined}
                >
                  <div className="min-w-0">
                    <div className="truncate font-heading text-base font-bold text-foreground">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-zinc-400">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  {item.href && (
                    <span className="shrink-0 text-green-400 transition-transform duration-200 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  )}
                </a>
              </div>
            </motion.div>
          );
        })}

        {/* Navigation indicators */}
        <div
          aria-label="Card navigation"
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2"
          role="tablist"
        >
          {Array.from({ length: items.length }, (_, i) => (
            <motion.button
              aria-label={`Ir para o card ${i + 1} de ${items.length}`}
              aria-selected={i === currentIndex}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-brand focus:ring-offset-1",
                i === currentIndex
                  ? "scale-125 bg-brand"
                  : "bg-zinc-600 hover:bg-zinc-500"
              )}
              key={`scrollable-indicator-${items[i]?.id || i}`}
              onClick={() => {
                if (i !== currentIndex && !isScrolling) {
                  setIsScrolling(true);
                  setCurrentIndex(i);
                  scrollY.set(i * SNAP_DISTANCE);
                  setTimeout(() => {
                    setIsScrolling(false);
                  }, transitionDuration + SCROLL_TIMEOUT_OFFSET);
                }
              }}
              role="tab"
              transition={{
                type: "spring" as const,
                stiffness: 250,
                damping: 20,
                mass: 0.5,
              }}
              type="button"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Instructions for screen readers */}
        <div aria-live="polite" className="sr-only">
          {`Card ${currentIndex + 1} de ${items.length}. Use as setas para navegar um card por vez, ou clique nos pontos abaixo.`}
        </div>
      </div>
    </section>
  );
};

export default ScrollableCardStack;
