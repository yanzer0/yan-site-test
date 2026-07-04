"use client";
// @ts-nocheck
/* eslint-disable */

import * as React from "react"
import { useRef, useMemo, useEffect } from "react"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"

/**
 * 🏆 ULTRA-PREMIUM 3D CAROUSEL
 */

// Defaults que no Framer vinham de addPropertyControls + defaultProps.
// React 19 IGNORA .defaultProps em function component -> mergeamos na mao aqui,
// senao itemWidth/perspective/etc chegam undefined e o carrossel quebra.
const CAROUSEL_DEFAULTS = {
    images: [],
    layoutProps: {
        itemWidth: 500,
        itemHeight: 285,
        sideItemWidth: 320,
        sideItemHeight: 280,
        gap: 64,
    },
    effectProps: {
        maxRotation: 90,
        perspective: 400,
        scrollDamping: 100,
    },
    stylingProps: {
        borderRadius: 10,
    },
    blurProps: {
        blurSpread: 25,
        blurStrength: 24,
    },
}

export default function ProgressiveSmearCarousel(incomingProps) {
    incomingProps = { ...CAROUSEL_DEFAULTS, ...incomingProps }

    // STEP 1 (Intercept & Flatten): Flatten incoming group props to keep logic references clean
    const props = {
        ...incomingProps,
        ...(incomingProps.layoutProps || {}),
        ...(incomingProps.stylingProps || {}),
        ...(incomingProps.effectProps || {}),
        ...(incomingProps.blurProps || {}),
    }

    const {
        images,
        items,
        itemWidth,
        itemHeight,
        sideItemWidth,
        sideItemHeight,
        gap,
        maxRotation,
        perspective,
        borderRadius,
        scrollDamping,
        blurSpread,
        blurStrength,
        // Destructure grouped prop keys out so they don't get spread to the DOM element
        layoutProps,
        stylingProps,
        effectProps,
        blurProps,
        ...domProps
    } = props

    const defaultColors = [
        "linear-gradient(135deg, #1E3A8A, #3B82F6)",
        "linear-gradient(135deg, #064E3B, #10B981)",
        "linear-gradient(135deg, #b91c1c, #ef4444)",
        "linear-gradient(135deg, #c2410c, #f97316)",
        "linear-gradient(135deg, #4C1D95, #8B5CF6)",
        "linear-gradient(135deg, #164e63, #06b6d4)",
    ]

    const renderItems = useMemo(() => {
        let pool
        if (items && items.length > 0) {
            pool = items.map((it) =>
                typeof it === "string"
                    ? { src: it }
                    : { src: it.img || it.src, name: it.name, desc: it.desc }
            )
        } else if (images && images.length > 0) {
            pool = images.map((s) => ({ src: s }))
        } else {
            pool = defaultColors.map((s) => ({ src: s }))
        }
        const arr = []
        while (arr.length < 18) {
            arr.push(...pool)
        }
        return arr
    }, [items, images])

    const totalItems = renderItems.length
    const scrollTarget = useRef(0)
    const rawScroll = useMotionValue(0)
    const snapTimeout = useRef(null)
    const mountRef = useRef(null)

    const smoothScroll = useSpring(rawScroll, {
        stiffness: 180,
        damping: scrollDamping,
        mass: 1,
        restDelta: 0.001,
    })

    const handleWheel = (e) => {
        const delta =
            Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY * 0.8
        scrollTarget.current += delta * 0.004
        rawScroll.set(scrollTarget.current)

        clearTimeout(snapTimeout.current)
        snapTimeout.current = setTimeout(() => {
            scrollTarget.current = Math.round(scrollTarget.current)
            rawScroll.set(scrollTarget.current)
        }, 150)
    }

    const handlePan = (e, info) => {
        const delta = -info.delta.x * 0.005
        scrollTarget.current += delta
        rawScroll.set(scrollTarget.current)
        clearTimeout(snapTimeout.current)
    }

    const handlePanEnd = (e, info) => {
        scrollTarget.current += -info.velocity.x * 0.0015
        scrollTarget.current = Math.round(scrollTarget.current)
        rawScroll.set(scrollTarget.current)
    }

    return (
        <div
            {...domProps}
            ref={mountRef}
            style={{
                width: "100%",
                height: "100%",
                minWidth: 600,
                minHeight: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                perspective: Math.max(perspective, 1),
                overflow: "hidden",
                position: "relative",
                ...props.style,
            }}
        >
            <motion.div
                data-lenis-prevent
                onWheel={handleWheel}
                onPan={handlePan}
                onPanEnd={handlePanEnd}
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 9999,
                    cursor: "grab",
                    touchAction: "pan-y",
                }}
            />

            <div
                style={{
                    position: "relative",
                    width: 0,
                    height: 0,
                    transformStyle: "preserve-3d",
                }}
            >
                {renderItems.map((it, i) => (
                    <PremiumSmearCard
                        key={`card-${i}`}
                        src={it.src}
                        name={it.name}
                        desc={it.desc}
                        index={i}
                        total={totalItems}
                        smoothScroll={smoothScroll}
                        itemWidth={itemWidth}
                        itemHeight={itemHeight}
                        sideItemWidth={sideItemWidth}
                        sideItemHeight={sideItemHeight}
                        gap={gap}
                        maxRotation={maxRotation}
                        borderRadius={borderRadius}
                    />
                ))}
            </div>

            {/* FIXED EDGE CONTENT BLUR (LEFT) */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${blurSpread}%`,
                    backdropFilter: `blur(${blurStrength}px)`,
                    WebkitBackdropFilter: `blur(${blurStrength}px)`,
                    maskImage:
                        "linear-gradient(to right, black 0%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to right, black 0%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 10000,
                }}
            />

            {/* FIXED EDGE CONTENT BLUR (RIGHT) */}
            <div
                style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: `${blurSpread}%`,
                    backdropFilter: `blur(${blurStrength}px)`,
                    WebkitBackdropFilter: `blur(${blurStrength}px)`,
                    maskImage:
                        "linear-gradient(to left, black 0%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to left, black 0%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 10000,
                }}
            />
        </div>
    )
}

function PremiumSmearCard({
    src,
    name,
    desc,
    index,
    total,
    smoothScroll,
    itemWidth,
    itemHeight,
    sideItemWidth,
    sideItemHeight,
    gap,
    maxRotation,
    borderRadius,
}) {
    const localOffset = useTransform(smoothScroll, (v) => {
        let linearBase = index - v
        let mapped = ((linearBase % total) + total) % total
        if (mapped > total / 2) mapped -= total
        return mapped
    })

    const absOffset = useTransform(localOffset, Math.abs)

    const cardWidth = useTransform(
        absOffset,
        [0, 1],
        [itemWidth, sideItemWidth],
        { clamp: true }
    )
    const cardHeight = useTransform(
        absOffset,
        [0, 1],
        [itemHeight, sideItemHeight],
        { clamp: true }
    )

    const marginLeft = useTransform(cardWidth, (w) => -w / 2)
    const marginTop = useTransform(cardHeight, (h) => -h / 2)

    const x = useTransform(localOffset, (o) => {
        const a = Math.abs(o)
        const s = Math.sign(o)

        const centerToNext = itemWidth / 2 + gap + sideItemWidth / 2
        const sideToSide = sideItemWidth + gap

        if (a === 0) return 0
        if (a <= 1) {
            return s * centerToNext * a
        } else {
            return s * (centerToNext + (a - 1) * sideToSide * 0.85)
        }
    })

    const z = useTransform(absOffset, (a) => -a * 200)

    const rotateY = useTransform(localOffset, (o) => {
        return Math.sign(o) * Math.min(Math.abs(o) * 35, maxRotation)
    })

    const zIndex = useTransform(absOffset, (a) => 1000 - Math.round(a * 10))

    const visibilityOpacity = useTransform(absOffset, [0, 5, 7], [1, 1, 0])

    const isImage =
        typeof src === "string" &&
        (src.startsWith("http") ||
            src.startsWith("data:") ||
            src.startsWith("/"))
    const styleData = isImage
        ? {
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
          }
        : { background: src }

    return (
        <motion.div
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                marginLeft,
                marginTop,
                width: cardWidth,
                height: cardHeight,
                rotateY,
                x,
                z,
                zIndex,
                transformStyle: "preserve-3d",
                borderRadius,
                overflow: "hidden",
                opacity: visibilityOpacity,
                boxShadow: "0 30px 80px -24px rgba(0,0,0,0.7)",
            }}
        >
            <div style={{ position: "absolute", inset: 0, ...styleData }} />
            {(name || desc) && (
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: "18px 20px 20px",
                        textAlign: "left",
                        color: "#fff",
                        background:
                            "linear-gradient(to top, rgba(5,7,9,0.94) 0%, rgba(5,7,9,0.6) 52%, transparent 100%)",
                    }}
                >
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 19,
                            lineHeight: 1.15,
                            letterSpacing: "-0.01em",
                        }}
                    >
                        {name}
                    </div>
                    {desc && (
                        <div
                            style={{
                                marginTop: 7,
                                fontSize: 12.5,
                                lineHeight: 1.42,
                                opacity: 0.82,
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {desc}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    )
}
