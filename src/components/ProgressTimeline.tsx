'use client';

import React from 'react';
import clsx from 'clsx';
import {filipRealEvents, chapterLines, impactConfig} from '@/data/graphData';
import AchievementModal, {AchievementData} from './AchievementModal';
import {loadAchievement} from '@/lib/loadAchievement';

// ==================== TYPES ====================
export type ProgressEvent = {
    year: number;
    month: number;
    level: number;
    impactType: 'None' | 'Lesson' | 'Regional' | 'National' | 'International' | 'World-Class' | 'Exceptional';
    category: string;
    dotSize?: number;
    article?: string;
    significant?: boolean; // ADD THIS LINE
};

// ==================== CONSTANTS ====================
const LAYOUT_CONFIG = {
    TOTAL_YEARS: 11,
    BASE_GAP: 2,
    EXPANDED_GAP: 5,
    PAD_TOP: 16,
    PAD_BOTTOM: 40,
    LEVEL_TOP: 6,
    REVEAL_BIAS: 0.10,
    EPS: 0.002,
    HEADER_SPACE: 260,
    CONTROL_STRIP_HEIGHT: 40, // NEW - space for toggle and legend
} as const;

const ANIMATION_CONFIG = {
    DURATION: 460,
    MAX_FPS: 60,
    EASING: (t: number) => 1 - Math.pow(1 - t, 3),
} as const;

const HINT_CONFIG = {
    AUTO_HIDE_DELAY: 5000,
    SHOW_ON_RECLICK_DELAY: 5000,
} as const;

// ==================== UTILITIES ====================
const yearIndex = (year: number) => year - 2016;

function cumulativeWithGaps(widths: readonly number[], gap: number) {
    const out = new Array(widths.length).fill(0);
    let acc = 0;
    for (let i = 0; i < widths.length; i++) {
        out[i] = acc;
        acc += widths[i] + (i < widths.length - 1 ? gap : 0);
    }
    return {positions: out, total: acc};
}

function straightPath(points: { x: number; y: number }[]) {
    if (points.length < 2) return points.length ? `M ${points[0].x},${points[0].y}` : '';
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) d += ` L ${points[i].x},${points[i].y}`;
    return d;
}

function spansForGap(
    TOTAL_YEARS: number,
    baseYearWidth: number,
    expandedFactor: number,
    FIXED_TOTAL_WIDTH: number,
    gap: number
) {
    const sumWidths = FIXED_TOTAL_WIDTH - (TOTAL_YEARS - 1) * gap;
    const big = baseYearWidth * expandedFactor;
    const remaining = sumWidths - big;
    const small = Math.max(30, remaining / (TOTAL_YEARS - 1));
    return {normal: small, big};
}

// ==================== HOOKS ====================
function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
    const [width, setWidth] = React.useState(0);

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const updateWidth = () => {
            const w = el.clientWidth;
            setWidth(Math.max(0, Math.round(w)));
        };

        // Debounce helper
        let timeoutId: number | null = null;
        const debouncedUpdate = () => {
            if (timeoutId) window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(updateWidth, 150);
        };

        const rafId = requestAnimationFrame(updateWidth);
        const ro = new ResizeObserver(debouncedUpdate);
        ro.observe(el);

        return () => {
            cancelAnimationFrame(rafId);
            if (timeoutId) window.clearTimeout(timeoutId);
            ro.disconnect();
        };
    }, [ref]);

    return width;
}

function useHintVisibility() {
    const [showHint, setShowHint] = React.useState(true);
    const [hasEverInteracted, setHasEverInteracted] = React.useState(false);
    const timerRef = React.useRef<number | null>(null);

    const hideHint = React.useCallback(() => setShowHint(false), []);

    const onInteraction = React.useCallback(() => {
        if (!hasEverInteracted) {
            setHasEverInteracted(true);
            setShowHint(false);
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    }, [hasEverInteracted]);

    const toggleHint = React.useCallback(() => {
        setShowHint(prev => !prev);
    }, []);

    React.useEffect(() => {
        if (!showHint) return;

        const delay = hasEverInteracted ? HINT_CONFIG.SHOW_ON_RECLICK_DELAY : HINT_CONFIG.AUTO_HIDE_DELAY;
        timerRef.current = window.setTimeout(hideHint, delay);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [showHint, hasEverInteracted, hideHint]);

    return {showHint, hasEverInteracted, onInteraction, toggleHint};
}


// NEW: Scroll-driven typewriter with pause detection
// NEW: Scroll-driven typewriter with pause detection
function useScrollTypewriter(ref: React.RefObject<HTMLDivElement | null>) {
    const [scrollProgress, setScrollProgress] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
    const pauseTimerRef = React.useRef<number | null>(null);
    const lastProgressRef = React.useRef(0);
    const lastChangeTimeRef = React.useRef(Date.now());

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let rafId: number | null = null;

        const handleScroll = () => {
            if (rafId) return;

            rafId = requestAnimationFrame(() => {
                const rect = el.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                const start = windowHeight - 150;
                const end = windowHeight * 0.4;

                const progress = 1 - Math.max(0, Math.min(1, (rect.top - end) / (start - end)));
                setScrollProgress(progress);

                // More sensitive change detection
                const progressDiff = Math.abs(progress - lastProgressRef.current);

                if (progressDiff > 0.005) {
                    // Progress changed significantly - user is scrolling
                    lastChangeTimeRef.current = Date.now();
                    setIsPaused(false);
                    if (pauseTimerRef.current) {
                        clearTimeout(pauseTimerRef.current);
                        pauseTimerRef.current = null;
                    }
                } else if (progress > 0.01 && progress < 0.99) {
                    // Progress hasn't changed and we're mid-animation
                    const timeSinceChange = Date.now() - lastChangeTimeRef.current;

                    if (timeSinceChange > 500 && !isPaused) {
                        // Been still for 500ms - start blinking
                        setIsPaused(true);
                    }
                }

                lastProgressRef.current = progress;
                rafId = null;
            });
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, {passive: true});
        window.addEventListener('resize', handleScroll, {passive: true});

        // Check pause state periodically
        const intervalId = setInterval(() => {
            const timeSinceChange = Date.now() - lastChangeTimeRef.current;
            const progress = lastProgressRef.current;

            if (timeSinceChange > 500 && progress > 0.01 && progress < 0.99 && !isPaused) {
                setIsPaused(true);
            }
        }, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            clearInterval(intervalId);
            if (rafId) cancelAnimationFrame(rafId);
            if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        };
    }, [isPaused]);

    return {scrollProgress, isPaused};
}
// NEW: Time-based typewriter that "chases" scroll target
function useTimedTypewriter(targetCharCount: number, charDelay: number = 50) {
    const [actualCharCount, setActualCharCount] = React.useState(0);
    const lastTargetRef = React.useRef(0);
    const intervalRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (actualCharCount === targetCharCount) {
            lastTargetRef.current = targetCharCount;
            return;
        }

        // DETECT DIRECTION
        const isTyping = targetCharCount > actualCharCount;
        const isUntyping = targetCharCount < actualCharCount;

        // Untyping is 2x faster
        const delay = isUntyping ? charDelay / 2 : charDelay;

        intervalRef.current = window.setInterval(() => {
            setActualCharCount(current => {
                // Moving toward target
                if (isTyping && current >= targetCharCount) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return targetCharCount;
                }
                if (isUntyping && current <= targetCharCount) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return targetCharCount;
                }

                // Step one character in the right direction
                return isTyping ? current + 1 : current - 1;
            });
        }, delay);

        lastTargetRef.current = targetCharCount;

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [targetCharCount, charDelay, actualCharCount]);

    return actualCharCount;
}

// ==================== STYLES ====================
const styles = `
.tl-wrap {
    position: relative;
    overflow-x: auto;
    overflow-y: visible;
    padding: 20px 100px;
    box-sizing: border-box;
    min-height: 400px;
    outline: none;
}

@media (max-width: 1200px) {
    .tl-wrap {
        padding-left: 60px;
        padding-right: 60px;
    }
}

@media (max-width: 768px) {
    .tl-wrap {
        padding-left: 20px;
        padding-right: 20px;
    }
}

.tl-wrap:focus-visible {
    box-shadow: 0 0 0 2px rgba(255,255,255,0.25) inset;
    border-radius: 4px;
}

.tl-rail {
    position: relative;
    margin: 0 auto;
    will-change: width;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0;
}

.tl-header,
.tl-plot {
    width: 100%;
}

.tl-plot { position: relative;}

.tl-header {
    position: relative;
    margin: 0;
    pointer-events: none;
}

.tl-header-spine {
    position: absolute;
    top: -100vh; /* CHANGED: Extend upward */
    bottom: 0;
    width: 1px;
    background: rgba(255,255,255,0.16);
    pointer-events: none;
}

.tl-header-title {
    position: absolute;
    left: 20px;
    bottom: 6px;
    margin: 0;
    font: 700 clamp(40px, 6vw, 84px)/0.95 "Rajdhani", monospace;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.88);
    margin-top: -0.1em;
}
/* NEW: Typewriter animation */
.tl-header-title-line {
    display: block;
    overflow: hidden;
    white-space: nowrap;
}

.tl-header-title-char {
    display: inline-block;
    opacity: 0;
}

.tl-header-title-char--visible {
    opacity: 1;
    /* No transition - instant appearance */
}

/* Cursor - only visible at the current typing position */
.tl-header-cursor {
    display: inline-block;
    width: 3px;
    height: 0.9em;
    background: rgba(255, 255, 255, 0.9);
    margin-left: 4px;
    vertical-align: middle;
    opacity: 0;
}

.tl-header-cursor--typing {
    opacity: 1;
    animation: none; /* Solid while typing */
}

.tl-header-cursor--paused {
    opacity: 1;
    animation: tlCursorBlink 0.8s step-end infinite;
}

.tl-header-cursor--complete {
    opacity: 1;
    animation: tlCursorBlink 0.8s step-end 4, tlCursorFadeOut 0.6s ease-out 2.5s forwards;
}

@keyframes tlCursorBlink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

@keyframes tlCursorFadeOut {
    to { opacity: 0; }
}

.tl-header-emphasis {
    color: #FFD447;
    font-size: 1.14em;
    display: block;
}

.tl-line {
    height: 1px;
    background: rgba(255,255,255,0.12);
    width: 100%;
    margin: 0;
    pointer-events: none;
}

.tl-line--top { background: rgba(255,255,255,0.16); margin-bottom: 14px; }
.tl-line--bottom { margin-top: 24px;  margin-bottom: -20px;}

.tl-connector {
    position: absolute;
    right: 0;
    top: 260px;
    bottom: -20px;
    width: 1px;
    background: rgba(255,255,255,0.14);
    pointer-events: none;
}

.tl-legend-inline{
    position: absolute;
    top: -2px;
    right: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: none;
    background: transparent;
}
.tl-legend-title{
    font:600 10px/1 'Rajdhani','Rajdhani Fallback',monospace;
    letter-spacing:.18em;
    color:rgba(255,255,255,.52);
    text-transform:uppercase;
    margin-right:6px;
}
.tl-legend-item{
    display:inline-flex;
    align-items:center;
    gap:6px;
    font:500 12px/1 'Rajdhani','Rajdhani Fallback',monospace;
    color:rgba(255,255,255,.85);
}
.tl-legend-dot{
    width:9px;height:9px;border-radius:50%;
    border:1px solid rgba(255,255,255,.25);
}

/* ============ TOGGLE  ============ */
/* ---------- Toggle ---------- */
.tl-toggle-wrapper{
  position:absolute; top:-2px; left:20px; z-index:15; pointer-events:auto;
}
.tl-toggle-container{
  display:flex; align-items:center; gap:18px; background:transparent; border:none; padding:0; cursor:pointer;
}
.tl-toggle-label-left,
.tl-toggle-label-right{
  font:400 14px/1 'Rajdhani','Rajdhani Fallback',monospace;
  letter-spacing:.08em; text-transform:uppercase;
  color:rgba(255,255,255,.35);
  transition:color .35s cubic-bezier(.22,1,.36,1), transform .35s cubic-bezier(.22,1,.36,1);
  white-space:nowrap;
}
.tl-toggle-label-left:hover,
.tl-toggle-label-right:hover{ color:rgba(255,255,255,.6); }
.tl-toggle-label-active{ font-weight:700; color:#fff; transform:scale(1.02); }
.tl-toggle-label-active.tl-toggle-label-right{
  color:rgba(255,215,0,1); text-shadow:0 0 12px rgba(255,215,0,.4);
}


/* Register an animatable custom property for the swell scale */

.tl-toggle-track{
  --track-w:46px;
  --track-h:24px;
  --pad:2px;
  --thumb:18px;
  /* distance the thumb travels */
  --tx: calc(var(--track-w) - var(--thumb) - var(--pad)*2);
  position:relative;
  width:var(--track-w); height:var(--track-h);
  border-radius:999px;
  background:transparent;
  border:1.5px solid rgba(255,255,255,.25);
  transition:border-color .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1);
}

/* Provide a default for the translate position */
.tl-toggle-track .tl-toggle-slider{
  --pos: 0px;     /* updated below when Key is active */
  --sx: 1;        /* animated during swell */
}

/* When Key Milestones is active -> thumb sits on right end */
.tl-toggle-track[data-key-active="true"] .tl-toggle-slider{
  --pos: var(--tx);
}

/* OUTER THUMB = position/translate only */
.tl-toggle-slider{
  position:absolute; top:var(--pad); left:var(--pad);
  width:var(--thumb); height:var(--thumb);
  border-radius:999px;
  background: transparent;
  /* smoother, slightly longer, high spring easing */
  transition: transform 340ms cubic-bezier(.16,1,.3,1);
  transform: translateX(0);
  will-change: transform;
}

/* thumb on RIGHT when Key is active */
.tl-toggle-track[data-key-active="true"] .tl-toggle-slider{
  transform: translateX(var(--tx));
}

/* INNER LAYER = look + swell */
.tl-toggle-swell{
  width:100%; height:100%;
  border-radius:inherit;
  background: rgba(255,255,255,.95);
  box-shadow: 0 2px 8px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.1);
  transform: scaleX(1);
  will-change: transform;
}

/* gold when Key is active */
.tl-toggle-slider[data-gold="true"] .tl-toggle-swell{
  background: linear-gradient(135deg, rgba(255,215,0,1) 0%, rgba(255,190,0,1) 100%);
  box-shadow:
    0 2px 8px rgba(255,215,0,.4),
    0 1px 3px rgba(255,215,0,.3),
    inset 0 1px 2px rgba(255,255,255,.3);
}

/* smoother swell: widen → hold → settle; runs alongside the slide */
@keyframes tl-swell {
  0%   { transform: scaleX(1);    }
  30%  { transform: scaleX(1.32); }  /* widen */
  50%  { transform: scaleX(1.32); }  /* hold while traveling */
  100% { transform: scaleX(1);    }  /* settle at end */
}

/* pick the origin based on travel direction */
.tl-toggle-slider[data-swell="left"]  .tl-toggle-swell{
  transform-origin: left center;
  animation: tl-swell 260ms cubic-bezier(.16,1,.3,1);
}
.tl-toggle-slider[data-swell="right"] .tl-toggle-swell{
  transform-origin: right center;
  animation: tl-swell 260ms cubic-bezier(.16,1,.3,1);
}

/* (Optional) subtle track highlight when right side is active */
.tl-toggle-track[data-key-active="true"]{
  border-color:rgba(255,215,0,.5);
  box-shadow:0 0 10px rgba(255,215,0,.15);
}

/* Responsive */
@media (max-width:768px){
  .tl-toggle-track{
    --track-w:42px; --track-h:22px; --thumb:16px;
    --tx: calc(var(--track-w) - var(--thumb) - var(--pad)*2);
  }
}

/* ============ /TOGGLE ============ */

.tl-path {
    fill: none;
    stroke: #fff;
    stroke-width: 2.5;
}

.tl-tick {
    stroke: rgba(255, 255, 255, 0.18);
    stroke-width: 0.5;
    stroke-dasharray: 3 3;
}

.tl-month-group { opacity: 0; transition: opacity 0.22s cubic-bezier(0.22,1,0.36,1); }

.tl-month-tick {
    stroke: rgba(255, 255, 255, 0.12);
    stroke-width: 0.6;
    stroke-dasharray: 2 2;
}

.tl-month-bottom-tick {
    stroke: rgba(255, 255, 255, 0.28);
    stroke-width: 0.9;
}

.tl-month-label {
    font: 500 10px/1 'Rajdhani', 'Rajdhani Fallback', monospace;
    letter-spacing: 0.05em;
    fill: rgba(255, 255, 255, 0.64);
}

.tl-dot { cursor: pointer; transition: r 180ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.tl-dot-glow { filter: blur(10px); transition: opacity 160ms cubic-bezier(0.22,1,0.36,1); }

.tl-dot-label {
    font: 600 13px/1 'Rajdhani', 'Rajdhani Fallback', monospace;
    letter-spacing: 0.06em;
    fill: #fff;
    paint-order: stroke;
    stroke: rgba(0, 0, 0, 0.85);
    stroke-width: 4px;
    transition: font-size 180ms cubic-bezier(0.22,1,0.36,1);
    pointer-events: none;
}

.tl-dot-label-exceptional {
    font: 600 13px/1 'Rajdhani', 'Rajdhani Fallback', monospace;
    letter-spacing: 0.06em;
    fill: none; /* Important: remove default SVG fill */
    paint-order: stroke;
    stroke: rgba(0, 0, 0, 0.85);
    stroke-width: 4px;
    pointer-events: none;
    transition: font-size 180ms cubic-bezier(0.22,1,0.36,1);
}

/* Apply gradient fill using SVG foreignObject or use a simpler approach with single gold color */
.tl-dot-label-exceptional {
    fill: #FFD60A !important; /* Solid gold - works in SVG */
    filter: drop-shadow(0 0 4px rgba(255, 214, 10, 0.6)) drop-shadow(0 0 8px rgba(255, 214, 10, 0.3));
}

.tl-dot,
.tl-dot-glow,
.tl-dot-border,
.tl-dot-core,
.tl-dot-exceptional,
.tl-dot-label,
.tl-dot-label-exceptional {
    transition: 
        r 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.tl-dot-hidden {
    opacity: 0;
    pointer-events: none;
}

.tl-dot-visible {
    opacity: 1;
}

.tl-year-typo,
.tl-y-axis-caption {
    color: rgba(255,255,255,0.78);
    fill: currentColor;
    font-family: 'Rajdhani', 'Rajdhani Fallback', monospace;
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    transition: font-size 160ms cubic-bezier(0.22,1,0.36,1), fill 160ms cubic-bezier(0.22,1,0.36,1), opacity 160ms cubic-bezier(0.22,1,0.36,1);
}

.tl-level-label {
    fill: rgba(255, 255, 255, 0.72);
    font: 600 10px/1 'Rajdhani', 'Rajdhani Fallback', monospace;
    letter-spacing: .10em;
}

.tl-chapter-line {
    stroke: rgba(255,255,255,0.85);
    stroke-dasharray: 5 5;
    cursor: default;
    transition: opacity 160ms cubic-bezier(0.22,1,0.36,1), stroke-width 160ms cubic-bezier(0.22,1,0.36,1);
}

.tl-chapter-label {
    font: 600 12px/1 'Rajdhani', 'Rajdhani Fallback', monospace;
    letter-spacing: 0.16em;
    fill: rgba(255,255,255,0.92);
    text-anchor: start;
    transition: opacity 160ms cubic-bezier(0.22,1,0.36,1);
}

.tl-chapter-caption {
    font: 500 10px/1 'Rajdhani', 'Rajdhani Fallback', monospace;
    letter-spacing: 0.12em;
    fill: rgba(255,255,255,0.65);
    text-anchor: start;
    transition: opacity 160ms cubic-bezier(0.22,1,0.36,1);
}

.tl-hint {
    position: absolute;
    top: 20px;
    right: 6px;
    background: rgba(20, 20, 20, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 10px 16px;
    font: 500 13px/1.2 'Rajdhani', monospace;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.9);
    z-index: 15;
    pointer-events: none;
    animation: tlHintFadeIn 0.4s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@keyframes tlHintFadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.tl-info-btn {
    position: absolute;
    top: -6px;
    right: 8px;
    background: rgba(30, 30, 30, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.65);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    z-index: 12;
    animation: tlInfoPulse 3s ease-in-out infinite;
}

.tl-info-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    animation: none;
}

@keyframes tlInfoPulse {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
        opacity: 0.8;
    }
    50% {
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0);
        opacity: 1;
    }
}

.tl-year-lock-hint {
    pointer-events: none;
    animation: tlLockPulse 2.5s ease-in-out infinite;
}

@keyframes tlLockPulse {
    0%, 100% {
        opacity: 0.5;
    }
    50% {
        opacity: 0.95;
    }
}

.tl-teaser-pulse {
    animation: tlTeaserPulse 2s ease-in-out infinite;
}

@keyframes tlTeaserPulse {
    0%, 100% { 
        opacity: 0.3; 
        transform: scale(1); 
    }
    50% { 
        opacity: 0.8; 
        transform: scale(1.15); 
    }
}

.tl-current-marker {
    fill: #FFD447;
    font: 600 10px/1 'Rajdhani', 'Rajdhani Fallback', monospace;
    letter-spacing: 0.12em;
}

@media (max-width: 768px) {
    .tl-hint {
        top: auto;
        bottom: 20px;
        right: 50%;
        transform: translateX(50%);
        font-size: 12px;
        padding: 8px 12px;
    }

    .tl-info-btn {
        top: 6px;
        right: 6px;
        width: 32px;
        height: 32px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .tl-month-group,
    .tl-dot,
    .tl-dot-glow,
    .tl-year-typo,
    .tl-chapter-label,
    .tl-hint,
    .tl-info-btn,
    .tl-teaser-pulse,
    .tl-path { transition: none !important; animation: none !important; }
}

.tl-header-gold {
    background: linear-gradient(135deg, #FEF3C7 0%, #FDE047 25%, #FFD60A 50%, #F59E0B 75%, #B45309 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 8px rgba(255, 214, 10, 0.4));
    animation: goldShimmer 3s ease-in-out infinite;
}

@keyframes goldShimmer {
    0%, 100% {
        filter: drop-shadow(0 0 8px rgba(255, 214, 10, 0.4));
    }
    50% {
        filter: drop-shadow(0 0 12px rgba(255, 214, 10, 0.6));
    }
}
`;

// ==================== COMPONENT ====================
type Props = {
    events?: ProgressEvent[];
    height?: number;
    baseYearWidth?: number;
    expandedFactor?: number;
    className?: string;
};

export default function ProgressTimeline({
                                             events = filipRealEvents,
                                             height = 425,
                                             baseYearWidth,
                                             expandedFactor = 4.2,
                                             className,
                                         }: Props) {
    const {
        TOTAL_YEARS,
        BASE_GAP,
        EXPANDED_GAP,
        PAD_TOP,
        PAD_BOTTOM,
        LEVEL_TOP,
        REVEAL_BIAS,
        EPS,
        HEADER_SPACE
    } = LAYOUT_CONFIG;

    const containerRef = React.useRef<HTMLDivElement>(null);
    const headerRef = React.useRef<HTMLDivElement>(null);
    const widthsRef = React.useRef<Float64Array>(new Float64Array(TOTAL_YEARS));
    const gapRef = React.useRef<number>(BASE_GAP);
    const hoverRAF = React.useRef<number | null>(null);
    const pendingHoverX = React.useRef<number | null>(null);
    const prevActiveRef = React.useRef<number | null>(null);
    const currActiveRef = React.useRef<number | null>(null);

    const containerWidth = useContainerWidth(containerRef);
    const FIXED_TOTAL_WIDTH = Math.max(320, containerWidth);

    const derivedBaseYearWidth = React.useMemo(() => {
        const sum = FIXED_TOTAL_WIDTH - (TOTAL_YEARS - 1) * BASE_GAP;
        return sum / TOTAL_YEARS;
    }, [FIXED_TOTAL_WIDTH, TOTAL_YEARS, BASE_GAP]);

    const effectiveBaseYearWidth = baseYearWidth ?? derivedBaseYearWidth;

    const [modalData, setModalData] = React.useState<AchievementData | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [hoverYear, setHoverYear] = React.useState<number>(-1);
    const [activeYear, setActiveYear] = React.useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = React.useState<ProgressEvent | null>(null);
    const [hoveredDot, setHoveredDot] = React.useState<{year: number, month: number} | null>(null);
    const hoverDelayRef = React.useRef<number | null>(null);

    const [animatedWidths, setAnimatedWidths] = React.useState<number[]>(
        () => Array.from({length: TOTAL_YEARS}, () => effectiveBaseYearWidth)
    );
    const [animatedGap, setAnimatedGap] = React.useState<number>(BASE_GAP);
    const [hasLoaded, setHasLoaded] = React.useState(false);
    const [showTeaser, setShowTeaser] = React.useState(false);
    const TEASER_EVENT_YEAR = 2019; // Sydney breakthrough
    const TEASER_EVENT_MONTH = 6;
    const TEASER_EVENT_LEVEL = 4.8; // Actual level of Sydney achievement

    const {showHint, onInteraction, toggleHint} = useHintVisibility();
    const titleLines = ['Every Lesson.', 'Every Pivot.', 'Every Win.'];
    const {scrollProgress: typewriterProgress, isPaused} = useScrollTypewriter(headerRef);

// Calculate TARGET characters based on scroll progress
    const totalChars = titleLines.reduce((sum, line) => sum + line.length, 0);
    const targetCharCount = Math.floor(typewriterProgress * totalChars);

// ACTUAL characters typed (chases target with time delay)
    const actualCharCount = useTimedTypewriter(targetCharCount, 50); // 50ms per character

    const visibleChars = React.useMemo(() => {
        let remaining = actualCharCount; // CHANGED: Use actualCharCount instead
        return titleLines.map(line => {
            const lineChars = Math.min(line.length, Math.max(0, remaining));
            remaining -= line.length;
            return lineChars;
        });
    }, [actualCharCount, titleLines]); // CHANGED: Depend on actualCharCount

    const complete = typewriterProgress >= 0.99;

    const focusedYear = activeYear ?? hoverYear;
    const targetGap = focusedYear >= 0 ? EXPANDED_GAP : BASE_GAP;
    const activeIdx = activeYear ?? hoverYear;

    // --- state (replace your old showAllEvents/dir/dirTimerRef) ---
    const [showAllEvents, setShowAllEvents] = React.useState(true);
    const [swell, setSwell] = React.useState<null | 'left' | 'right'>(null);
    const swellTimerRef = React.useRef<number | null>(null);

    const handleToggle = React.useCallback(() => {
        const next = !showAllEvents;
        // direction = where the thumb will travel
        const direction: 'left' | 'right' = next ? 'left' : 'right';

        setSwell(direction);         // start swell NOW
        setShowAllEvents(next);      // start slide in the SAME frame

        if (swellTimerRef.current) window.clearTimeout(swellTimerRef.current);
        // match CSS animation length below (360ms)
        swellTimerRef.current = window.setTimeout(() => setSwell(null), 380);
    }, [showAllEvents]);

    React.useEffect(() => {
        return () => {
            if (swellTimerRef.current) window.clearTimeout(swellTimerRef.current);
        };
    }, []);


    React.useEffect(() => {
        return () => {
            if (hoverDelayRef.current) {
                clearTimeout(hoverDelayRef.current);
            }
        };
    }, []);

// keep your visibleEvents memo
    const visibleEvents = React.useMemo(() => {
        if (showAllEvents) return events;
        return events.filter(ev => ev.significant === true || ev.impactType === 'None');
    }, [events, showAllEvents]);


    // Path drawing animation
    React.useEffect(() => {
        const timer = setTimeout(() => setHasLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Teaser pulse (3 seconds after loading, then fade)
    React.useEffect(() => {
        const showTimer = setTimeout(() => setShowTeaser(true), 2000);
        const hideTimer = setTimeout(() => setShowTeaser(false), 5000);
        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    React.useEffect(() => {
        prevActiveRef.current = currActiveRef.current;
        currActiveRef.current = (activeIdx !== null && activeIdx >= 0) ? activeIdx : null;
        if (activeIdx !== null && activeIdx >= 0) {
            onInteraction();
        }
    }, [activeIdx, onInteraction]);

    const yOf = React.useCallback((level: number) => {
        const innerH = height - PAD_TOP - PAD_BOTTOM;
        const clamped = Math.max(0, Math.min(LEVEL_TOP, level));
        return PAD_TOP + (LEVEL_TOP - clamped) / LEVEL_TOP * innerH;
    }, [height, PAD_TOP, PAD_BOTTOM, LEVEL_TOP]);

    const yTop6 = yOf(6);
    const yTop5 = yOf(5);
    const yBottom = yOf(0);

    React.useEffect(() => {
        const next = new Float64Array(TOTAL_YEARS).fill(effectiveBaseYearWidth);
        widthsRef.current = next;
        setAnimatedWidths(Array.from(next));
    }, [effectiveBaseYearWidth, TOTAL_YEARS]);

    const targetWidths = React.useMemo(() => {
        const sum = FIXED_TOTAL_WIDTH - (TOTAL_YEARS - 1) * targetGap;
        const arr = new Array(TOTAL_YEARS).fill(0);
        if (focusedYear >= 0 && focusedYear < TOTAL_YEARS) {
            const big = effectiveBaseYearWidth * expandedFactor;
            const remaining = sum - big;
            const small = Math.max(30, remaining / (TOTAL_YEARS - 1));
            arr.fill(small);
            arr[focusedYear] = big;
        } else {
            const normal = sum / TOTAL_YEARS;
            arr.fill(normal);
        }
        return arr;
    }, [FIXED_TOTAL_WIDTH, targetGap, focusedYear, effectiveBaseYearWidth, expandedFactor, TOTAL_YEARS]);

    React.useEffect(() => {
        const {DURATION, MAX_FPS, EASING} = ANIMATION_CONFIG;
        const frameBudget = 1000 / MAX_FPS;
        let raf = 0, start: number | null = null, lastCommit = 0;

        const targetW = new Float64Array(TOTAL_YEARS);
        for (let i = 0; i < TOTAL_YEARS; i++) targetW[i] = targetWidths[i];
        const targetG = targetGap;
        const initialW = widthsRef.current.slice(0);
        const initialG = gapRef.current;

        const tick = (now: number) => {
            if (start === null) start = now;
            const t = Math.min(1, (now - start) / DURATION);
            const ease = EASING(t);
            let changed = false;

            for (let i = 0; i < TOTAL_YEARS; i++) {
                const v = initialW[i] + (targetW[i] - initialW[i]) * ease;
                if (Math.abs(v - widthsRef.current[i]) > 0.25) {
                    widthsRef.current[i] = v;
                    changed = true;
                }
            }

            const newG = initialG + (targetG - initialG) * ease;
            if (Math.abs(newG - gapRef.current) > 0.1) {
                gapRef.current = newG;
                changed = true;
            }

            if (changed && (now - lastCommit) >= frameBudget) {
                lastCommit = now;
                setAnimatedWidths(Array.from(widthsRef.current));
                setAnimatedGap(gapRef.current);
            }

            if (t < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                widthsRef.current.set(targetW);
                gapRef.current = targetG;
                setAnimatedWidths(Array.from(targetW));
                setAnimatedGap(targetG);
            }
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [targetWidths, targetGap, TOTAL_YEARS]);

    const {positions: xAtYear} = React.useMemo(
        () => cumulativeWithGaps(animatedWidths, animatedGap),
        [animatedWidths, animatedGap]
    );

    const yearBounds = React.useMemo(() => {
        const arr: Array<{ left: number; right: number }> = [];
        for (let y = 0; y < TOTAL_YEARS; y++) {
            const left = xAtYear[y];
            const right = (y < TOTAL_YEARS - 1) ? xAtYear[y + 1] : xAtYear[y] + animatedWidths[y];
            arr.push({left, right});
        }
        return arr;
    }, [xAtYear, animatedWidths, TOTAL_YEARS]);

    const handleMouseMove = React.useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (activeYear !== null && activeYear >= 0) return;
        const svg = e.currentTarget;

        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

        // NEW: Ignore hover if cursor is in top 80px of graph
        const minHoverY = 25; // Adjust this value - higher = less sensitive area at top
        if (svgP.y < minHoverY) {
            // Clear hover when in top area
            setHoverYear(-1);
            return;
        }

        pendingHoverX.current = svgP.x;

        if (hoverRAF.current == null) {
            hoverRAF.current = requestAnimationFrame(() => {
                if (pendingHoverX.current == null) {
                    hoverRAF.current = null;
                    return;
                }
                const x = pendingHoverX.current;
                pendingHoverX.current = null;
                for (let y = 0; y < yearBounds.length; y++) {
                    const {left, right} = yearBounds[y];
                    if (x >= left && x < right) {
                        setHoverYear(y);
                        hoverRAF.current = null;
                        return;
                    }
                }
                setHoverYear(-1);
                hoverRAF.current = null;
            });
        }
    }, [activeYear, yearBounds]);

    const handleMouseLeave = React.useCallback(() => {
        if (hoverRAF.current) cancelAnimationFrame(hoverRAF.current);
        hoverRAF.current = null;
        if (activeYear === null) setHoverYear(-1);
    }, [activeYear]);

    const handleSvgClick = React.useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;

        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        const x = svgP.x;

        for (let y = 0; y < yearBounds.length; y++) {
            const {left, right} = yearBounds[y];
            if (x >= left && x < right) {
                setActiveYear(prev => (prev === y ? null : y));
                return;
            }
        }
    }, [yearBounds]);

    const {
        normal,
        big
    } = spansForGap(TOTAL_YEARS, effectiveBaseYearWidth, expandedFactor, FIXED_TOTAL_WIDTH, targetGap);
    const rawRevealByYear = animatedWidths.map(w => {
        const denom = Math.max(1e-3, big - normal);
        return Math.max(0, Math.min(1, (w - normal) / denom));
    });

    const maxRevealIdx = React.useMemo(() => {
        let max = -1, idx = -1;
        for (let i = 0; i < rawRevealByYear.length; i++) {
            if (rawRevealByYear[i] > max) {
                max = rawRevealByYear[i];
                idx = i;
            }
        }
        return max > EPS ? idx : -1;
    }, [rawRevealByYear, EPS]);

    const eventsByYear = React.useMemo(() => {
        const m = new Map<number, ProgressEvent[]>();
        for (const ev of events) {
            const yi = yearIndex(ev.year);
            if (yi < 0 || yi >= TOTAL_YEARS) continue;
            if (!m.has(yi)) m.set(yi, []);
            m.get(yi)!.push(ev);
        }
        for (const arr of m.values()) arr.sort((a, b) => a.month - b.month);
        return m;
    }, [events, TOTAL_YEARS]);

    const points = React.useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        for (let y = 0; y < TOTAL_YEARS; y++) {
            const evs = eventsByYear.get(y) || [];
            if (evs.length === 0) continue;
            const yearStart = xAtYear[y];
            const yearEnd = y < TOTAL_YEARS - 1 ? xAtYear[y + 1] : xAtYear[y] + animatedWidths[y];
            const span = yearEnd - yearStart;
            for (const ev of evs) {
                const t = (ev.month - 1) / 12;
                const x = yearStart + t * span;
                pts.push({x, y: yOf(ev.level)});
            }
        }
        return pts;
    }, [eventsByYear, xAtYear, animatedWidths, yOf, TOTAL_YEARS]);

    const pathD = React.useMemo(() => straightPath(points), [points]);

    // Approximate path length for animation (safe for SSR)
    const pathLength = React.useMemo(() => {
        if (points.length < 2) return 2000;
        let total = 0;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            total += Math.sqrt(dx * dx + dy * dy);
        }
        return total;
    }, [points]);

    const uid = React.useId();

    const focusHighlight = React.useMemo(() => {
        if (focusedYear < 0) return null;

        const left = xAtYear[focusedYear];
        const right = (focusedYear < TOTAL_YEARS - 1)
            ? xAtYear[focusedYear + 1]
            : xAtYear[focusedYear] + animatedWidths[focusedYear];
        const width = right - left;

        const glowXId = `glowX-${uid}`;
        const fadeYId = `fadeY-${uid}`;
        const maskId = `fadeMask-${uid}`;

        return (
            <g pointerEvents="none">
                <defs>
                    <linearGradient id={glowXId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0"/>
                        <stop offset="18%" stopColor="#fff" stopOpacity="0.06"/>
                        <stop offset="50%" stopColor="#fff" stopOpacity="0.12"/>
                        <stop offset="82%" stopColor="#fff" stopOpacity="0.06"/>
                        <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
                    </linearGradient>

                    <linearGradient
                        id={fadeYId}
                        x1="0" y1="0" x2="0" y2="1"
                    >
                        <stop offset="0%" stopColor="#fff" stopOpacity="0"/>
                        <stop offset="6%" stopColor="#fff" stopOpacity="1"/>
                        <stop offset="94%" stopColor="#fff" stopOpacity="1"/>
                        <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
                    </linearGradient>

                    <mask id={maskId}>
                        <rect x={0} y={0} width={FIXED_TOTAL_WIDTH} height={height} fill={`url(#${fadeYId})`}/>
                    </mask>
                </defs>

                <rect
                    x={left}
                    y={0}
                    width={width}
                    height={height}
                    fill={`url(#${glowXId})`}
                    mask={`url(#${maskId})`}
                    style={{mixBlendMode: 'screen'}}
                />
            </g>
        );
    }, [focusedYear, xAtYear, animatedWidths, FIXED_TOTAL_WIDTH, height, uid, TOTAL_YEARS]);

    const legend = (
        <div className="tl-legend-inline" aria-hidden="true">
            <span className="tl-legend-title">IMPACT SCALE</span>
            {impactConfig.types.map((type) => (
                <span key={type} className="tl-legend-item">
                <i
                    className="tl-legend-dot"
                    style={{
                        background: impactConfig.legendColors[type], // Use solid legendColors
                        boxShadow: `0 0 6px ${impactConfig.legendColors[type]}60`,
                        borderColor: `${impactConfig.legendColors[type]}55`,
                    }}
                />
                    {type}
            </span>
            ))}
        </div>
    );

    const toggleControl = (
        <div className="tl-toggle-wrapper">
            <button
                className="tl-toggle-container"
                onClick={handleToggle}
                aria-pressed={!showAllEvents}
                aria-label={showAllEvents ? "Show key milestones only" : "Show all events"}
            >
    <span className={clsx("tl-toggle-label-left", showAllEvents && "tl-toggle-label-active")}>
      Show All Events
    </span>

                <div
                    className="tl-toggle-track"
                    data-key-active={!showAllEvents}
                >
                    <div
                        className="tl-toggle-slider"
                        data-gold={!showAllEvents}
                        data-swell={swell || undefined}
                    >
                        <div className="tl-toggle-swell"/>
                    </div>
                </div>

                <span className={clsx("tl-toggle-label-right", !showAllEvents && "tl-toggle-label-active")}>
      Key Milestones
    </span>
            </button>
        </div>
    );


    const interactionHint = showHint && (
        <div className="tl-hint">
            💡 Hover years to expand • Click to lock
        </div>
    );

    const infoButton = (
        <button
            className="tl-info-btn"
            onClick={toggleHint}
            aria-label="Show interaction help"
        >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <text x="10" y="14.5" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="500">i</text>
            </svg>
        </button>
    );

    return (
        <>
            <style>{styles}</style>
            <div
                className={clsx('tl-wrap', className)}
                ref={containerRef}
                aria-label="Progress timeline"
            >
                <div className="tl-rail">
                    <div className="tl-header" style={{height: HEADER_SPACE}} aria-hidden="true" ref={headerRef}>
                        <div className="tl-header-spine"/>
                        <h1 className="tl-header-title">
                            {titleLines.map((line, lineIdx) => {
                                const chars = line.split('');
                                const visibleCount = visibleChars[lineIdx];

                                const isActivelyTyping = visibleCount > 0 && visibleCount < chars.length;
                                const isLineComplete = visibleCount >= chars.length;
                                const isFinalLine = lineIdx === titleLines.length - 1;

                                return (
                                    <span
                                        key={lineIdx}
                                        className={clsx(
                                            'tl-header-title-line',
                                            lineIdx === 2 && 'tl-header-emphasis tl-header-gold'
                                        )}
                                    >
                {chars.map((char, charIdx) => (
                    <React.Fragment key={charIdx}>
                        <span
                            className={clsx(
                                'tl-header-title-char',
                                charIdx < visibleCount && 'tl-header-title-char--visible'
                            )}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                        {/* Show cursor RIGHT AFTER this character if it's the last visible one */}
                        {isActivelyTyping && charIdx === visibleCount - 1 && (
                            <span
                                className={clsx(
                                    'tl-header-cursor',
                                    isPaused ? 'tl-header-cursor--paused' : 'tl-header-cursor--typing'
                                )}
                            />
                        )}
                    </React.Fragment>
                ))}
                                        {/* Cursor at end when line complete (only on final line) */}
                                        {isLineComplete && isFinalLine && complete && (
                                            <span className="tl-header-cursor tl-header-cursor--complete" />
                                        )}
            </span>
                                );
                            })}
                        </h1>
                    </div>

                    <div className="tl-line tl-line--top" aria-hidden="true"/>

                    <div className="tl-plot" style={{position: 'relative', height}}>
                        {toggleControl}
                        {legend}
                        {infoButton}
                        {interactionHint}

                        <svg
                            className="tl-svg"
                            width="100%"
                            height={height}
                            viewBox={`0 0 ${FIXED_TOTAL_WIDTH} ${height}`}
                            preserveAspectRatio="none"
                            style={{
                                position: 'absolute',
                                top: '10px',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                overflow: 'visible'
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleSvgClick}
                        >
                            <defs>
                                {/* Metallic Purple - Lesson */}
                                <linearGradient id="metallic-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#C084FC" stopOpacity="1"/>
                                    <stop offset="40%" stopColor="#9333EA" stopOpacity="1"/>
                                    <stop offset="60%" stopColor="#7A2FB8" stopOpacity="1"/>
                                    <stop offset="100%" stopColor="#581C87" stopOpacity="1"/>
                                </linearGradient>

                                {/* Metallic Blue - Regional */}
                                <linearGradient id="metallic-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="1"/>
                                    <stop offset="40%" stopColor="#3B82F6" stopOpacity="1"/>
                                    <stop offset="60%" stopColor="#2563EB" stopOpacity="1"/>
                                    <stop offset="100%" stopColor="#1E40AF" stopOpacity="1"/>
                                </linearGradient>

                                {/* Metallic Teal - National */}
                                <linearGradient id="metallic-teal" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#5EEAD4" stopOpacity="1"/>
                                    <stop offset="40%" stopColor="#14B8A6" stopOpacity="1"/>
                                    <stop offset="60%" stopColor="#059669" stopOpacity="1"/>
                                    <stop offset="100%" stopColor="#047857" stopOpacity="1"/>
                                </linearGradient>

                                {/* Metallic Amber - International */}
                                <linearGradient id="metallic-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FCD34D" stopOpacity="1"/>
                                    <stop offset="40%" stopColor="#FBBF24" stopOpacity="1"/>
                                    <stop offset="60%" stopColor="#D97706" stopOpacity="1"/>
                                    <stop offset="100%" stopColor="#92400E" stopOpacity="1"/>
                                </linearGradient>

                                {/* Metallic Red - World-Class */}
                                <linearGradient id="metallic-red" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FCA5A5" stopOpacity="1"/>
                                    <stop offset="40%" stopColor="#EF4444" stopOpacity="1"/>
                                    <stop offset="60%" stopColor="#DC2626" stopOpacity="1"/>
                                    <stop offset="100%" stopColor="#991B1B" stopOpacity="1"/>
                                </linearGradient>

                                {/* Metallic Gold - Exceptional (with a glow) */}
                                <linearGradient id="metallic-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FEF3C7" stopOpacity="1"/>
                                    <stop offset="25%" stopColor="#FDE047" stopOpacity="1"/>
                                    <stop offset="50%" stopColor="#FFD60A" stopOpacity="1"/>
                                    <stop offset="75%" stopColor="#F59E0B" stopOpacity="1"/>
                                    <stop offset="100%" stopColor="#B45309" stopOpacity="1"/>
                                </linearGradient>


                                {/* Keep your existing gradients (glowX, fadeY, mask) below this */}
                            </defs>
                            {focusHighlight}

                            {Array.from({length: 6}).map((_, i) => (
                                <line key={`lvl-${i}`} x1={0} x2={FIXED_TOTAL_WIDTH} y1={yOf(i)} y2={yOf(i)}
                                      className="tl-tick"/>
                            ))}

                            {Array.from({length: 6}).map((_, i) => (
                                <text key={`lvl-label-${i}`} x={2} y={yOf(i) - 3} className="tl-level-label">{i}</text>
                            ))}
                            <g transform={`translate(-10, ${((yTop5 + yBottom) / 2) - 6})`}>
                                <text transform="rotate(-90)" textAnchor="middle" className="tl-y-axis-caption">
                                    PROGRESS LEVEL
                                </text>
                            </g>

                            {Array.from({length: TOTAL_YEARS}).map((_, i) => {
                                const x = xAtYear[i];
                                return <line key={`tick-${i}`} x1={x} x2={x} y1={yBottom} y2={yBottom + 8}
                                             className="tl-tick"/>;
                            })}

                            {Array.from({length: TOTAL_YEARS}).map((_, y) => {
                                if (activeIdx !== null && activeIdx >= 0) {
                                    const prevIdx = prevActiveRef.current;
                                    if (y !== activeIdx && y !== prevIdx) return null;
                                } else {
                                    if (y !== maxRevealIdx || rawRevealByYear[y] <= EPS) return null;
                                }

                                const revealRaw = rawRevealByYear[y];
                                const isActive = activeIdx !== null && activeIdx >= 0 && y === activeIdx;
                                const displayReveal = isActive ? Math.min(1, revealRaw / REVEAL_BIAS) : revealRaw;
                                if (displayReveal <= EPS) return null;

                                const yearStart = xAtYear[y];
                                const yearEnd = y < TOTAL_YEARS - 1 ? xAtYear[y + 1] : xAtYear[y] + animatedWidths[y];
                                const span = yearEnd - yearStart;

                                return (
                                    <g key={`months-${y}`} className="tl-month-group" style={{opacity: displayReveal}}>
                                        {Array.from({length: 13}).map((_, m) => {
                                            const monthX = yearStart + (m / 12) * span;
                                            const sw = 0.3 + displayReveal * 0.7;
                                            const delay = `${m * 0.012}s`;
                                            return (
                                                <g key={`month-${y}-${m}`}>
                                                    <line
                                                        x1={monthX} x2={monthX} y1={yTop5} y2={yBottom}
                                                        className="tl-month-tick"
                                                        style={{
                                                            strokeWidth: `${sw}px`,
                                                            transition: `stroke-width 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}`
                                                        }}
                                                    />
                                                    {m < 12 && (
                                                        <line
                                                            x1={monthX} x2={monthX} y1={yBottom} y2={yBottom + 4}
                                                            className="tl-month-bottom-tick"
                                                            style={{
                                                                strokeWidth: `${sw}px`,
                                                                transition: `stroke-width 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}`
                                                            }}
                                                        />
                                                    )}
                                                    <text
                                                        x={monthX} y={yBottom + 18}
                                                        className="tl-month-label"
                                                        textAnchor="middle"
                                                        style={{
                                                            opacity: displayReveal,
                                                            transition: `opacity 0.18s cubic-bezier(0.22,1,0.36,1) ${delay}`
                                                        }}
                                                    >
                                                        {m === 12 ? 1 : m + 1}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </g>
                                );
                            })}

                            <path
                                d={pathD}
                                className="tl-path"
                                style={{
                                    strokeDasharray: hasLoaded ? 'none' : pathLength,
                                    strokeDashoffset: hasLoaded ? 0 : pathLength,
                                    transition: 'stroke-dashoffset 2s ease-out'
                                }}
                            />

                            {/* PASS 1: Dots + Hit Areas */}
                            {events.map(ev => {
                                const yIdx = yearIndex(ev.year);
                                const yearStart = xAtYear[yIdx];
                                const yearEnd = yIdx < TOTAL_YEARS - 1 ? xAtYear[yIdx + 1] : xAtYear[yIdx] + animatedWidths[yIdx];
                                const span = yearEnd - yearStart;
                                const t = (ev.month - 1) / 12;
                                const x = yearStart + t * span;
                                const y = yOf(ev.level);

                                const inFocusedYear = focusedYear === yIdx;
                                const dotColor = impactConfig.colors[ev.impactType];
                                const legendColor = impactConfig.legendColors[ev.impactType];
                                const baseSize = ev.dotSize ?? impactConfig.defaultDotSize;
                                const hoveredSize = baseSize * 2;
                                const isHovered = inFocusedYear && hoveredDot?.year === ev.year && hoveredDot?.month === ev.month;
                                const isExceptional = ev.impactType === 'Exceptional';
                                const isNone = ev.impactType === 'None';
                                const isVisible = showAllEvents || ev.significant === true || ev.impactType === 'None';
                                const dotOpacity = isVisible ? 1 : 0;

                                return (
                                    <g key={`dot-${ev.year}.${ev.month}`} style={{ opacity: dotOpacity, transition: 'opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }}>
                                        {/* 1. GLOW */}
                                        <circle
                                            cx={x} cy={y}
                                            r={hoveredSize + 6}
                                            className="tl-dot-glow"
                                            style={{
                                                fill: legendColor,
                                                opacity: isNone ? 0 : isExceptional ? (isHovered ? 0.6 : 0.3) : (isHovered ? 0.6 : 0),
                                            }}
                                            pointerEvents="none"
                                        />

                                        {/* 2. DOT RENDERING */}
                                        {isNone ? (
                                            <circle
                                                cx={x} cy={y}
                                                r={isHovered ? hoveredSize : baseSize}
                                                fill="#FFFFFF"
                                                className="tl-dot"
                                                style={{ transition: 'r 180ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                                                pointerEvents="none"
                                            />
                                        ) : isExceptional ? (
                                            <circle
                                                cx={x} cy={y}
                                                r={isHovered ? hoveredSize : baseSize}
                                                fill={dotColor}
                                                className="tl-dot-exceptional"
                                                style={{
                                                    filter: isHovered
                                                        ? 'drop-shadow(0 0 6px #FFD60A) drop-shadow(0 0 10px rgba(255,214,10,0.4))'
                                                        : 'drop-shadow(0 0 3px rgba(255,214,10,0.4))',
                                                    transition: 'r 180ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                }}
                                                pointerEvents="none"
                                            />
                                        ) : (
                                            <>
                                                <circle
                                                    cx={x} cy={y}
                                                    r={isHovered ? hoveredSize : baseSize}
                                                    fill="none"
                                                    stroke={dotColor}
                                                    strokeWidth={3}
                                                    className="tl-dot-border"
                                                    style={{
                                                        filter: isHovered ? `drop-shadow(0 0 8px ${legendColor})` : 'none',
                                                        transition: 'r 180ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                    }}
                                                    pointerEvents="none"
                                                />
                                                <circle
                                                    cx={x} cy={y}
                                                    r={(isHovered ? hoveredSize : baseSize) - 1}
                                                    fill="#fff"
                                                    className="tl-dot-core"
                                                    style={{ transition: 'r 180ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                                                    pointerEvents="none"
                                                />
                                            </>
                                        )}

                                        {/* 3. INVISIBLE HIT AREA */}
                                        <circle
                                            cx={x} cy={y}
                                            r={12}
                                            fill="transparent"
                                            style={{pointerEvents: isVisible ? 'auto' : 'none'}}
                                            onClick={async (e) => {
                                                if (!inFocusedYear) return;
                                                e.stopPropagation();
                                                if (ev.article) {
                                                    const data = await loadAchievement(ev.article);
                                                    setModalData(data);
                                                    setIsModalOpen(true);
                                                }
                                                setSelectedEvent(prev => (prev?.year === ev.year && prev.month === ev.month ? null : ev));
                                                setActiveYear(null);
                                            }}
                                            onMouseEnter={() => {
                                                if (!inFocusedYear) return;
                                                if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
                                                hoverDelayRef.current = window.setTimeout(() => {
                                                    setHoveredDot({year: ev.year, month: ev.month});
                                                    setSelectedEvent(ev);
                                                }, 150);
                                            }}
                                            onMouseLeave={() => {
                                                if (!inFocusedYear) return;
                                                if (hoverDelayRef.current) {
                                                    clearTimeout(hoverDelayRef.current);
                                                    hoverDelayRef.current = null;
                                                }
                                                setHoveredDot(null);
                                                setSelectedEvent(null);
                                            }}
                                        />
                                    </g>
                                );
                            })}

                            {/* PASS 2: Labels (render on top) */}
                            {events.map(ev => {
                                const yIdx = yearIndex(ev.year);
                                const yearStart = xAtYear[yIdx];
                                const yearEnd = yIdx < TOTAL_YEARS - 1 ? xAtYear[yIdx + 1] : xAtYear[yIdx] + animatedWidths[yIdx];
                                const span = yearEnd - yearStart;
                                const t = (ev.month - 1) / 12;
                                const x = yearStart + t * span;
                                const y = yOf(ev.level);

                                const inFocusedYear = focusedYear === yIdx;
                                const baseSize = ev.dotSize ?? impactConfig.defaultDotSize;
                                const hoveredSize = baseSize * 2;
                                const isHovered = inFocusedYear && hoveredDot?.year === ev.year && hoveredDot?.month === ev.month;
                                const isExceptional = ev.impactType === 'Exceptional';

                                const isVisible = showAllEvents || ev.significant === true || ev.impactType === 'None';
                                if (!inFocusedYear || !ev.category || !isVisible) return null;

                                return (
                                    <text
                                        key={`label-${ev.year}.${ev.month}`}
                                        x={x}
                                        y={(() => {
                                            const dotsInYear = eventsByYear.get(yIdx) || [];
                                            const dotIndex = dotsInYear.findIndex(d => d.year === ev.year && d.month === ev.month);
                                            const placeBelow = dotIndex % 2 === 1;
                                            return placeBelow
                                                ? y + (isHovered ? hoveredSize + 24 : baseSize + 18)
                                                : y - (isHovered ? hoveredSize + 12 : baseSize + 6);
                                        })()}
                                        className={isExceptional ? "tl-dot-label-exceptional" : "tl-dot-label"}
                                        textAnchor="middle"
                                        style={{
                                            fontSize: isHovered ? 17 : 13,
                                            opacity: hoveredDot ? (isHovered ? 1 : 0.2) : 1,
                                            transition: 'opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1), font-size 180ms cubic-bezier(0.22,1,0.36,1)'
                                        }}
                                    >
                                        {ev.category}
                                    </text>
                                );
                            })}

                            {chapterLines.map((line, index) => {
                                const yIdx = yearIndex(line.year);
                                const yearStart = xAtYear[yIdx];
                                const yearEnd = yIdx < TOTAL_YEARS - 1 ? xAtYear[yIdx + 1] : xAtYear[yIdx] + animatedWidths[yIdx];
                                const span = yearEnd - yearStart;
                                const t = (line.month - 1) / 12;
                                const x = yearStart + t * span;
                                const isActive = focusedYear === yIdx;
                                return (
                                    <g key={`chapter-${index}`}>
                                        <line
                                            x1={x} x2={x} y1={yTop6 + 10} y2={yBottom}
                                            className="tl-chapter-line"
                                            style={{
                                                opacity: isActive ? 0.95 : 0.18,
                                                strokeWidth: isActive ? 2 : 1,
                                            }}
                                        />
                                        <text
                                            x={x + 6} y={yTop6 + 18}
                                            className="tl-chapter-label"
                                            style={{
                                                opacity: isActive ? 0.8 : 0.35,
                                            }}
                                        >
                                            {line.label}
                                        </text>
                                        <text
                                            x={x + 6} y={yTop6 + 30}
                                            className="tl-chapter-caption"
                                            style={{
                                                opacity: isActive ? 0.7 : 0.25,
                                            }}
                                        >
                                            {line.caption}
                                        </text>
                                    </g>
                                );
                            })}

                            {showTeaser && (() => {
                                const yIdx = yearIndex(TEASER_EVENT_YEAR);
                                const yearStart = xAtYear[yIdx];
                                const yearEnd = yIdx < TOTAL_YEARS - 1 ? xAtYear[yIdx + 1] : xAtYear[yIdx] + animatedWidths[yIdx];
                                const span = yearEnd - yearStart;
                                const t = (TEASER_EVENT_MONTH - 1) / 12;
                                const x = yearStart + t * span;
                                const y = yOf(TEASER_EVENT_LEVEL);

                                return (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={20}
                                        className="tl-teaser-pulse"
                                        fill="none"
                                        stroke="rgba(255,215,0,0.6)"
                                        strokeWidth="2"
                                    />
                                );
                            })()}

                            {Array.from({length: TOTAL_YEARS}).map((_, y) => {
                                const left = xAtYear[y];
                                const right = (y < TOTAL_YEARS - 1) ? xAtYear[y + 1] : xAtYear[y] + animatedWidths[y];
                                const cx = left + (right - left) / 2;
                                const isFocus = focusedYear === y;
                                const isLocked = activeYear === y;
                                const dim = focusedYear >= 0 && !isFocus;

                                return (
                                    <g key={`ycap-${y}`}>
                                        <text
                                            x={cx}
                                            y={yBottom + 36}
                                            textAnchor="middle"
                                            className="tl-year-typo"
                                            style={{
                                                fill: isFocus ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.78)',
                                                opacity: dim ? 0.45 : 1,
                                                fontWeight: 700,
                                                fontSize: isFocus ? 16 : 14,
                                                letterSpacing: isFocus ? '0.2em' : '0.16em',
                                            }}
                                        >
                                            {2016 + y}
                                        </text>
                                        {isLocked && (
                                            <text
                                                x={cx}
                                                y={yBottom + 50}
                                                textAnchor="middle"
                                                className="tl-year-lock-hint"
                                                style={{
                                                    fill: 'rgba(255, 255, 255, 0.9)',
                                                    fontSize: '10px',
                                                    fontFamily: 'Rajdhani, monospace',
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase',
                                                    opacity: dim ? 0.38 : 1,
                                                }}
                                            >
                                                [ Click to unlock ]
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    <div className="tl-line tl-line--bottom" aria-hidden="true"/>
                    <div className="tl-connector" aria-hidden="true"/>
                </div>
            </div>
            <AchievementModal
                data={modalData}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}