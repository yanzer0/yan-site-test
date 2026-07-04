"use client";
// @ts-nocheck
/* eslint-disable */

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL TEXT — LINES / WORDS / CHARACTERS ANIMATION
// Created by AliThemes.com · originalmente Framer.
// Portado p/ Next/React 19: sem import "framer", useIsStaticRenderer -> SSR check,
// defaultProps -> merge manual (React 19 ignora .defaultProps), addPropertyControls removido.
// ═══════════════════════════════════════════════════════════════════════════

import * as React from "react"
import { useRef, useEffect, useMemo, useState } from "react"

const DEFAULT_TEXT =
    "Scroll down and watch each character come alive with smooth, staggered animation."

const PRESETS = {
    Default: {
        splitMode: "Characters",
        revealDirection: "Left to Right",
        stagger: 0.2,
        xOffset: 7,
        yOffset: 0,
        blur: 0,
        rotateX: 0,
        perspective: 800,
        scale: 1,
    },
    "Fade In Up": {
        splitMode: "Characters",
        revealDirection: "Left to Right",
        stagger: 0.15,
        xOffset: 0,
        yOffset: 25,
        blur: 0,
        rotateX: 0,
        perspective: 800,
        scale: 1,
    },
    "Blur Reveal": {
        splitMode: "Characters",
        revealDirection: "Left to Right",
        stagger: 0.2,
        xOffset: 0,
        yOffset: 0,
        blur: 8,
        rotateX: 0,
        perspective: 800,
        scale: 1,
    },
    Cinematic: {
        splitMode: "Characters",
        revealDirection: "Left to Right",
        stagger: 0.12,
        xOffset: 10,
        yOffset: 20,
        blur: 4,
        rotateX: 0,
        perspective: 800,
        scale: 1,
    },
    "3D Flip": {
        splitMode: "Characters",
        revealDirection: "Left to Right",
        stagger: 0.15,
        xOffset: 0,
        yOffset: 0,
        blur: 2,
        rotateX: 45,
        perspective: 800,
        scale: 1,
    },
    "Wave RTL": {
        splitMode: "Characters",
        revealDirection: "Right to Left",
        stagger: 0.1,
        xOffset: 5,
        yOffset: 15,
        blur: 0,
        rotateX: 0,
        perspective: 800,
        scale: 1,
    },
    Typewriter: {
        splitMode: "Characters",
        revealDirection: "Left to Right",
        stagger: 0.4,
        xOffset: 0,
        yOffset: 0,
        blur: 0,
        rotateX: 0,
        perspective: 800,
        scale: 1,
    },
    "Glitch Rise": {
        splitMode: "Characters",
        revealDirection: "Left to Right",
        stagger: 0.08,
        xOffset: 15,
        yOffset: 40,
        blur: 10,
        rotateX: 30,
        perspective: 600,
        scale: 1,
    },
    "Soft Words": {
        splitMode: "Words",
        revealDirection: "Left to Right",
        stagger: 0.3,
        xOffset: 0,
        yOffset: 12,
        blur: 3,
        rotateX: 0,
        perspective: 800,
        scale: 1,
    },
    "Cascade Down": {
        splitMode: "Characters",
        revealDirection: "Right to Left",
        stagger: 0.12,
        xOffset: 0,
        yOffset: -30,
        blur: 5,
        rotateX: -20,
        perspective: 900,
        scale: 1,
    },
    "Masked Lines": {
        splitMode: "Lines",
        revealDirection: "Left to Right",
        stagger: 0.15,
        xOffset: 0,
        yOffset: 0,
        blur: 0,
        rotateX: 0,
        perspective: 800,
        scale: 1,
    },
    "Scale Pop": {
        splitMode: "Characters",
        revealDirection: "Left to Right",
        stagger: 0.1,
        xOffset: 0,
        yOffset: 15,
        blur: 2,
        rotateX: 0,
        perspective: 800,
        scale: 0.5,
    },
}

// Antes vinha de ScrollRevealText.defaultProps (React 19 ignora) -> merge manual no topo da funcao.
const SCROLL_DEFAULTS = {
    preset: "Default",
    text: DEFAULT_TEXT,
    font: {
        fontFamily: "Inter",
        fontWeight: 600,
        fontSize: 62,
        lineHeight: "1.4em",
        letterSpacing: "-0.02em",
    },
    colorHidden: "#9ca3af",
    colorRevealed: "#111827",
    htmlTag: "div",
    trigger: "Scroll",
    onLoadDuration: 1.5,
    splitMode: "Characters",
    revealDirection: "Left to Right",
    stagger: 0.2,
    xOffset: 7,
    yOffset: 0,
    blur: 0,
    rotateX: 0,
    perspective: 800,
    scale: 1,
    offsetStart: 80,
    offsetEnd: 20,
}

export default function ScrollRevealText(props) {
    props = { ...SCROLL_DEFAULTS, ...props }

    const containerRef = useRef(null)
    const spanRefs = useRef([])
    const lineRefs = useRef([])
    const isVisible = useRef(false)
    const rafId = useRef(0)
    const scheduled = useRef(false)
    const [lineGroups, setLineGroups] = useState(null)
    const isStatic = typeof window === "undefined"

    const preset = props.preset !== "Custom" ? PRESETS[props.preset] : null

    const {
        text,
        font,
        colorHidden,
        colorRevealed,
        htmlTag,
        trigger,
        onLoadDuration,
        offsetStart,
        offsetEnd,
        style,
    } = props

    const splitMode = preset?.splitMode ?? props.splitMode
    const revealDirection = preset?.revealDirection ?? props.revealDirection
    const stagger = preset?.stagger ?? props.stagger
    const xOffset = preset?.xOffset ?? props.xOffset
    const yOffset = preset?.yOffset ?? props.yOffset
    const blur = preset?.blur ?? props.blur
    const rotateX = preset?.rotateX ?? props.rotateX
    const perspective = preset?.perspective ?? props.perspective
    const scale = preset?.scale ?? props.scale

    const isLinesMode = splitMode === "Lines"

    // Build word groups and animation unit indices
    const { allSpans, unitCount, wordGroups } = useMemo(() => {
        const tokens = String(text).split(/(\s+)/)
        const spans = []
        let unitIdx = 0

        tokens.forEach((token) => {
            const isSpace = /^\s+$/.test(token)
            const chars = Array.from(token)

            if (isSpace) {
                chars.forEach((ch) =>
                    spans.push({ char: ch, unit: -1, isSpace: true })
                )
            } else if (splitMode === "Words" || splitMode === "Lines") {
                const idx = unitIdx++
                chars.forEach((ch) =>
                    spans.push({ char: ch, unit: idx, isSpace: false })
                )
            } else {
                chars.forEach((ch) =>
                    spans.push({ char: ch, unit: unitIdx++, isSpace: false })
                )
            }
        })

        const groups = []
        let current = null
        spans.forEach((span, i) => {
            if (span.isSpace) {
                if (current) {
                    groups.push(current)
                    current = null
                }
                groups.push({ type: "space", spans: [{ ...span, idx: i }] })
            } else {
                if (!current) current = { type: "word", spans: [] }
                current.spans.push({ ...span, idx: i })
            }
        })
        if (current) groups.push(current)

        if (revealDirection === "Right to Left" && !isLinesMode) {
            const max = unitIdx - 1
            spans.forEach((s) => {
                if (!s.isSpace) s.unit = max - s.unit
            })
        }

        return { allSpans: spans, unitCount: unitIdx, wordGroups: groups }
    }, [text, splitMode, revealDirection, isLinesMode])

    // Lines mode: detect line breaks after render
    useEffect(() => {
        if (!isLinesMode || isStatic) {
            if (lineGroups !== null) setLineGroups(null)
            return
        }

        const detect = () => {
            const container = containerRef.current
            if (!container) return

            const wordEls = container.querySelectorAll("[data-wg]")
            if (wordEls.length === 0) return

            const positions = []
            wordEls.forEach((el) => {
                positions.push({
                    gi: parseInt(el.dataset.wg),
                    top: Math.round(el.getBoundingClientRect().top),
                })
            })

            const lineWordGis = []
            let currentLine = []
            let lastTop = -Infinity

            positions.forEach(({ gi, top }) => {
                if (currentLine.length > 0 && Math.abs(top - lastTop) > 3) {
                    lineWordGis.push([...currentLine])
                    currentLine = []
                }
                currentLine.push(gi)
                lastTop = top
            })
            if (currentLine.length > 0) lineWordGis.push([...currentLine])

            const lines = lineWordGis.map((wordGis, li) => {
                const start = wordGis[0]
                const end =
                    li < lineWordGis.length - 1
                        ? lineWordGis[li + 1][0]
                        : wordGroups.length
                return Array.from({ length: end - start }, (_, k) => start + k)
            })

            if (revealDirection === "Right to Left") lines.reverse()
            setLineGroups(lines)
        }

        requestAnimationFrame(() => requestAnimationFrame(detect))
    }, [text, splitMode, revealDirection, font, isLinesMode, wordGroups.length])

    // ── Animation engine ───────────────────────────────────────────────────
    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        if (isLinesMode && !lineGroups) return

        const totalUnits = isLinesMode ? lineGroups.length : unitCount
        if (totalUnits === 0) return

        if (!isLinesMode) {
            spanRefs.current = spanRefs.current.slice(0, allSpans.length)
        }

        const dur = 0.7
        const totalTime = dur + (totalUnits - 1) * stagger

        const applyProgress = (scrollP) => {
            const time = scrollP * totalTime

            if (isLinesMode) {
                lineRefs.current.forEach((el, lineIdx) => {
                    if (!el) return
                    const p =
                        totalUnits <= 1
                            ? scrollP
                            : Math.max(
                                  0,
                                  Math.min(1, (time - lineIdx * stagger) / dur)
                              )

                    const ty = ((1 - p) * 100).toFixed(1)
                    let tf = `translateY(${ty}%)`
                    if (rotateX !== 0) {
                        tf = `perspective(${perspective}px) rotateX(${(rotateX * (1 - p)).toFixed(1)}deg) ${tf}`
                    }
                    if (scale < 1) {
                        tf += ` scale(${(scale + (1 - scale) * p).toFixed(3)})`
                    }

                    el.style.transform = tf
                    el.style.opacity = `${0.3 + p * 0.7}`
                    el.style.filter =
                        blur > 0 ? `blur(${(blur * (1 - p)).toFixed(1)}px)` : ""
                    const pct = Math.round(p * 100)
                    el.style.color = `color-mix(in srgb, ${colorRevealed} ${pct}%, ${colorHidden})`
                })
            } else {
                spanRefs.current.forEach((el, i) => {
                    if (!el) return
                    const span = allSpans[i]
                    if (!span || span.isSpace) return

                    const p =
                        totalUnits <= 1
                            ? scrollP
                            : Math.max(
                                  0,
                                  Math.min(
                                      1,
                                      (time - span.unit * stagger) / dur
                                  )
                              )

                    el.style.opacity = `${0.3 + p * 0.7}`

                    const tx = (-xOffset + xOffset * p).toFixed(1)
                    const ty = (yOffset * (1 - p)).toFixed(1)
                    let tf = ""
                    if (rotateX !== 0) {
                        tf = `perspective(${perspective}px) rotateX(${(rotateX * (1 - p)).toFixed(1)}deg) `
                    }
                    tf += `translateX(${tx}px) translateY(${ty}px)`
                    if (scale < 1) {
                        tf += ` scale(${(scale + (1 - scale) * p).toFixed(3)})`
                    }

                    el.style.transform = tf
                    el.style.filter =
                        blur > 0 ? `blur(${(blur * (1 - p)).toFixed(1)}px)` : ""

                    const pct = Math.round(p * 100)
                    el.style.color = `color-mix(in srgb, ${colorRevealed} ${pct}%, ${colorHidden})`
                })
            }
        }

        // Framer canvas: show text fully visible, skip animation
        if (isStatic) {
            applyProgress(1)
            return
        }

        if (trigger === "On Load") {
            let started = false
            applyProgress(0)

            const startAnimation = () => {
                if (started) return
                started = true
                const startTime = performance.now()
                const animate = (now) => {
                    const elapsed = (now - startTime) / 1000
                    const rawP = Math.min(1, elapsed / onLoadDuration)
                    applyProgress(1 - Math.pow(1 - rawP, 3))
                    if (rawP < 1) rafId.current = requestAnimationFrame(animate)
                }
                rafId.current = requestAnimationFrame(animate)
            }

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        observer.disconnect()
                        startAnimation()
                    }
                },
                { threshold: 0.1 }
            )
            observer.observe(container)

            return () => {
                observer.disconnect()
                cancelAnimationFrame(rafId.current)
            }
        }

        // Scroll-based animation — com SUAVIZACAO temporal (lerp) p/ scroll fluido,
        // nao grudado 1:1 na barra (tira o "travado", vira glide tipo scrub do GSAP).
        const startFrac = offsetStart / 100
        const endFrac = offsetEnd / 100

        // alvo bruto a partir da posicao de scroll (o mesmo mapeamento de antes)
        const readTargetP = () => {
            const vh = window.innerHeight
            const rect = container.getBoundingClientRect()
            const range = (startFrac - endFrac) * vh
            if (range <= 0) return 1
            let p = Math.max(
                0,
                Math.min(1, (startFrac * vh - rect.top) / range)
            )
            if (isLinesMode && p === 0 && rect.top < vh && rect.bottom > 0)
                p = 1
            return p
        }

        // appliedP persegue targetP com easing por frame (menor SMOOTH = mais leve/preguicoso)
        const SMOOTH = 0.12
        let appliedP = readTargetP()
        applyProgress(appliedP)
        let looping = false

        const loop = () => {
            const target = readTargetP()
            appliedP += (target - appliedP) * SMOOTH
            if (Math.abs(target - appliedP) < 0.0015) {
                appliedP = target
                applyProgress(appliedP)
                looping = false
                return
            }
            applyProgress(appliedP)
            rafId.current = requestAnimationFrame(loop)
        }

        const kick = () => {
            if (looping || !isVisible.current) return
            looping = true
            rafId.current = requestAnimationFrame(loop)
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible.current = entry.isIntersecting
                if (entry.isIntersecting) kick()
            },
            { rootMargin: "200px" }
        )
        observer.observe(container)

        const onScroll = () => kick()

        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        kick()

        return () => {
            observer.disconnect()
            cancelAnimationFrame(rafId.current)
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
        }
    }, [
        allSpans,
        unitCount,
        lineGroups,
        isLinesMode,
        isStatic,
        stagger,
        xOffset,
        yOffset,
        blur,
        rotateX,
        perspective,
        scale,
        trigger,
        onLoadDuration,
        offsetStart,
        offsetEnd,
        colorHidden,
        colorRevealed,
    ])

    // ── Render ─────────────────────────────────────────────────────────────

    const Tag = htmlTag || "div"
    const containerStyle = { display: "inline-block", ...font, ...style }

    const renderWordGroup = (group, gi) => {
        if (group.type === "word") {
            return (
                <span
                    key={`w-${gi}`}
                    data-wg={gi}
                    style={{ whiteSpace: "nowrap", display: "inline" }}
                >
                    {group.spans.map(({ char, idx }) => (
                        <span
                            key={idx}
                            ref={(el) => {
                                spanRefs.current[idx] = el
                            }}
                            style={{
                                display: "inline-block",
                                willChange: isLinesMode
                                    ? undefined
                                    : "transform, opacity",
                            }}
                        >
                            {char}
                        </span>
                    ))}
                </span>
            )
        }
        return group.spans.map(({ char, idx }) => (
            <span key={idx} style={{ display: "inline-block" }}>
                {char === " " ? " " : char}
            </span>
        ))
    }

    // Lines mode with detected lines → render with overflow-hidden wrappers
    if (isLinesMode && lineGroups) {
        return (
            <Tag ref={containerRef} style={containerStyle}>
                {lineGroups.map((groupIndices, lineIdx) => (
                    <div
                        key={lineIdx}
                        style={{ overflow: "hidden", display: "block" }}
                    >
                        <div
                            ref={(el) => {
                                lineRefs.current[lineIdx] = el
                            }}
                            style={{
                                display: "block",
                                willChange: "transform, opacity",
                            }}
                        >
                            {groupIndices.map((gi) =>
                                renderWordGroup(wordGroups[gi], gi)
                            )}
                        </div>
                    </div>
                ))}
            </Tag>
        )
    }

    // Characters / Words mode (or Lines measurement phase)
    return (
        <Tag ref={containerRef} style={containerStyle}>
            {wordGroups.map((group, gi) => renderWordGroup(group, gi))}
        </Tag>
    )
}
