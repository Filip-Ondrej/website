'use client';

import React from 'react';
import clsx from 'clsx';
import {filipRealEvents, chapterLines, impactConfig} from '@/data/graphData';
import AchievementModal, { AchievementData } from './AchievementModal';
import { loadAchievement } from '@/lib/loadAchievement';

// ==================== TYPES ====================
export type ProgressEvent = {
    year: number;
    month: number;
    level: number;
    impactType: 'None' | 'Lesson' | 'Regional' | 'National' | 'International' | 'World-Class' | 'Exceptional';
    category: string;
    dotSize?: number;
    article?: string;
};
//
// type ChapterLine = {
//     year: number;
//     month: number;
//     label: string;
//     caption: string;
// };

// ==================== DATA (Your Real Story) ====================
// const filipRealEvents: ProgressEvent[] = [
//     // 2015 - The Spark
//     { year: 2015, month: 6, level: 0.8, impactType: 'Regional', category: 'First Competition' },
//
//     // 2016 - Taking Charge (Age 12, 7th grade)
//     { year: 2016, month: 3, level: 1.5, impactType: 'National', category: 'Robocup Win' },
//     { year: 2016, month: 9, level: 1.2, impactType: 'Lesson', category: 'Lab Access Key' },
//     { year: 2016, month: 11, level: 2.8, impactType: 'National', category: 'FLL Semifinals' },
//     { year: 2016, month: 12, level: 1.8, impactType: 'Lesson', category: 'Leadership Lesson' },
//
//     // 2017 - Hard Lessons
//     { year: 2017, month: 4, level: 0.5, impactType: 'Lesson', category: 'Magic Show Disaster' },
//     { year: 2017, month: 11, level: 2.2, impactType: 'Regional', category: 'Rescue Line' },
//
//     // 2018 - Going International (Age 14, 8th grade)
//     { year: 2018, month: 3, level: 3.2, impactType: 'International', category: 'Qualified for Canada' },
//     { year: 2018, month: 6, level: 3.8, impactType: 'International', category: 'RoboCup Montreal' },
//     { year: 2018, month: 8, level: 3.5, impactType: 'National', category: 'Educational Robot' },
//     { year: 2018, month: 9, level: 2.0, impactType: 'Lesson', category: 'Teacher Drowning' },
//
//     // 2019 - Breakthrough Year (Age 15, 9th grade)
//     { year: 2019, month: 3, level: 4.2, impactType: 'National', category: 'Robocup National Win' },
//     { year: 2019, month: 6, level: 4.8, impactType: 'World-Class', category: 'RoboCup Sydney 4th' },
//     { year: 2019, month: 7, level: 4.5, impactType: 'Exceptional', category: 'Mayor Award' },
//     { year: 2019, month: 9, level: 3.5, impactType: 'National', category: 'Perfect Exam Scores' },
//
//     // 2020 - High School King (Age 16-17, 1st-2nd year)
//     { year: 2020, month: 2, level: 3.2, impactType: 'National', category: 'Heat Pump Solution' },
//     { year: 2020, month: 5, level: 3.8, impactType: 'International', category: 'VALT Erasmus Lead' },
//     { year: 2020, month: 11, level: 4.9, impactType: 'World-Class', category: 'World Champion' },
//
//     // 2021 - Recognition Wave
//     { year: 2021, month: 1, level: 4.3, impactType: 'Exceptional', category: '3D Print National Win' },
//     { year: 2021, month: 4, level: 5.2, impactType: 'Exceptional', category: 'Young Creator 2021' },
//     { year: 2021, month: 9, level: 3.8, impactType: 'National', category: 'National TV Coverage' },
//
//     // 2022 - Dominance (Age 18, 3rd year)
//     { year: 2022, month: 2, level: 4.5, impactType: 'International', category: 'Europe 4th + Hardware Award' },
//     { year: 2022, month: 5, level: 5.0, impactType: 'Exceptional', category: 'Regional Chairman Award' },
//     { year: 2022, month: 7, level: 5.3, impactType: 'World-Class', category: 'Best Hardware Thailand' },
//     { year: 2022, month: 10, level: 4.2, impactType: 'International', category: 'Erasmus Italy Internship' },
//
//     // 2023 - Final Victory Lap (Age 19, 4th year)
//     { year: 2023, month: 3, level: 5.5, impactType: 'Exceptional', category: '6 Categories 5 Wins' },
//     { year: 2023, month: 5, level: 5.4, impactType: 'Exceptional', category: 'Young Creator 2023' },
//     { year: 2023, month: 6, level: 4.8, impactType: 'World-Class', category: 'Valedictorian' },
//     { year: 2023, month: 6, level: 5.6, impactType: 'Exceptional', category: 'Bordeaux PCB Legend' },
//     { year: 2023, month: 7, level: 5.8, impactType: 'Exceptional', category: 'Saint Gorazd Award' },
//
//     // 2024 - University & Transition (Age 20)
//     { year: 2024, month: 10, level: 3.5, impactType: 'International', category: 'Hamburg TU Start' },
//
//     // 2025 - Current Focus (Age 21)
//     { year: 2025, month: 2, level: 4.2, impactType: 'World-Class', category: 'Startup Deep Dive' },
// ];
//
// export const chapterLines: ChapterLine[] = [
//     { year: 2016, month: 1, label: 'Chapter 1', caption: 'Learning & Building' },
//     { year: 2019, month: 5, label: 'Chapter 2', caption: 'Breaking Through' },
//     { year: 2023, month: 2, label: 'Chapter 3', caption: 'Leading & Dominating' },
// ];
//
// const impactConfig = {
//     types: ['Lesson', 'Regional', 'National', 'International', 'World-Class', 'Exceptional'] as const,
//     colors: {
//         'Lesson': '#9D4EDD',
//         'Regional': '#3A86FF',
//         'National': '#06D6A0',
//         'International': '#FFD60A',
//         'World-Class': '#FF6B35',
//         'Exceptional': '#EF476F'
//     }
// };

// ==================== CONSTANTS ====================
const LAYOUT_CONFIG = {
    TOTAL_YEARS: 11,
    BASE_GAP: 2,
    EXPANDED_GAP: 5,
    PAD_TOP: 16,
    PAD_BOTTOM: 32,
    LEVEL_TOP: 6,
    REVEAL_BIAS: 0.10,
    EPS: 0.002,
    HEADER_SPACE: 260,
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

        const rafId = requestAnimationFrame(updateWidth);
        const ro = new ResizeObserver(() => requestAnimationFrame(updateWidth));
        ro.observe(el);

        return () => {
            cancelAnimationFrame(rafId);
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

// ==================== STYLES ====================
const styles = `
.tl-wrap {
    position: relative;
    overflow-x: auto;
    overflow-y: visible;
    border-top: 1px solid #fff;
    border-bottom: 1px solid #fff;
    padding: 10px 100px;
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

.tl-plot { position: relative; }
.tl-svg:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(255,255,255,.25) inset; border-radius: 6px; }

.tl-header {
    position: relative;
    margin: 0;
    pointer-events: none;
}

.tl-header-spine {
    position: absolute;
    top: 0;
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
.tl-line--bottom { margin-top: 24px; }

.tl-connector {
    position: absolute;
    right: 0;
    top: 260px;
    bottom: 0;
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
        opacity: 0.85;
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
                                             expandedFactor = 3.6,
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

    const focusedYear = activeYear ?? hoverYear;
    const targetGap = focusedYear >= 0 ? EXPANDED_GAP : BASE_GAP;
    const activeIdx = activeYear ?? hoverYear;

    // Path drawing animation
    React.useEffect(() => {
        const timer = setTimeout(() => setHasLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Teaser pulse (3 seconds after load, then fade)
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
                    <div className="tl-header" style={{height: HEADER_SPACE}} aria-hidden="true">
                        <div className="tl-header-spine"/>
                        <h1 className="tl-header-title">
                            Every Lesson.<br/>
                            Every Pivot.<br/>
                            <span className="tl-header-emphasis tl-header-gold">Every Win.</span>
                        </h1>
                    </div>

                    <div className="tl-line tl-line--top" aria-hidden="true"/>

                    <div className="tl-plot" style={{position: 'relative', height}}>
                        {legend}
                        {infoButton}
                        {interactionHint}

                        <svg
                            className="tl-svg"
                            width="100%"
                            height={height}
                            viewBox={`0 0 ${FIXED_TOTAL_WIDTH} ${height}`}
                            preserveAspectRatio="none"
                            style={{position: 'absolute', inset: 0, overflow: 'visible'}}
                            tabIndex={0}
                            role="img"
                            aria-label="Progress timeline, 2016–2026. Hover to expand, click to lock."
                            onKeyDown={(e) => {
                                if (e.key === 'ArrowRight') setHoverYear((y) => Math.min(10, (y < 0 ? 0 : y + 1)));
                                if (e.key === 'ArrowLeft') setHoverYear((y) => Math.max(0, (y < 0 ? 0 : y - 1)));
                                if (e.key === 'Enter' || e.key === ' ') setActiveYear((y) => (y === hoverYear ? null : hoverYear));
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

                                {/* Metallic Gold - Exceptional (with glow) */}
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

                            {/* Dots */}
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

                                // Use custom size if provided, otherwise use default
                                const baseSize = ev.dotSize ?? impactConfig.defaultDotSize;

                                const hoveredSize = baseSize * 2;
                                const isHovered = inFocusedYear && selectedEvent?.year === ev.year && selectedEvent.month === ev.month;

                                const isExceptional = ev.impactType === 'Exceptional';
                                const isNone = ev.impactType === 'None';

                                return (
                                    <g key={`${ev.year}.${ev.month}`}>
                                        {/* 1. GLOW - behind everything */}
                                        <circle
                                            cx={x} cy={y}
                                            r={hoveredSize + 6}
                                            className="tl-dot-glow"
                                            style={{
                                                fill: legendColor,
                                                opacity: isNone
                                                    ? 0
                                                    : isExceptional
                                                        ? (isHovered ? 0.6 : 0.3)
                                                        : (isHovered ? 0.6 : 0),
                                            }}
                                            pointerEvents="none"
                                        />

                                        {/* 2. DOT RENDERING */}
                                        {isNone ? (
                                            /* NONE: Simple white circle */
                                            <circle
                                                cx={x} cy={y}
                                                r={isHovered ? hoveredSize : baseSize}
                                                fill="#FFFFFF"
                                                className="tl-dot"
                                                style={{
                                                    transition: 'r 180ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                }}
                                                pointerEvents="none"
                                            />
                                        ) : isExceptional ? (
                                            /* EXCEPTIONAL: Full gold fill */
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
                                            /* REGULAR: Colored border plus white core (NO GAP) */
                                            <>
                                                {/* Outer border - same size as other dots */}
                                                <circle
                                                    cx={x} cy={y}
                                                    r={isHovered ? hoveredSize : baseSize}
                                                    fill="none"
                                                    stroke={dotColor}
                                                    strokeWidth={2}
                                                    className="tl-dot-border"
                                                    style={{
                                                        filter: isHovered ? `drop-shadow(0 0 8px ${legendColor})` : 'none',
                                                        transition: 'r 180ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                    }}
                                                    pointerEvents="none"
                                                />

                                                {/* Inner white core - accounting for stroke width, no gap */}
                                                <circle
                                                    cx={x} cy={y}
                                                    r={(isHovered ? hoveredSize : baseSize) - 1}
                                                    fill="#fff"
                                                    className="tl-dot-core"
                                                    style={{
                                                        transition: 'r 180ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                    }}
                                                    pointerEvents="none"
                                                />
                                            </>
                                        )}

                                        {/* 3. INVISIBLE HIT AREA */}
                                        <circle
                                            cx={x} cy={y}
                                            r={12}
                                            fill="transparent"
                                            onClick={async (e) => {
                                                if (!inFocusedYear) return;
                                                e.stopPropagation();

                                                // NEW: If event has article, load and show modal
                                                if (ev.article) {
                                                    const data = await loadAchievement(ev.article);
                                                    setModalData(data);
                                                    setIsModalOpen(true);
                                                }

                                                setSelectedEvent(prev => (prev?.year === ev.year && prev.month === ev.month ? null : ev));
                                                setActiveYear(null);
                                            }}
                                            onMouseEnter={() => {
                                                if (inFocusedYear) setSelectedEvent(ev);
                                            }}
                                            onMouseLeave={() => {
                                                if (inFocusedYear) setSelectedEvent(null);
                                            }}
                                        />

                                        {/* 4. LABEL */}
                                        {inFocusedYear && ev.category && (
                                            <text
                                                x={x}
                                                y={y - (isHovered ? hoveredSize + 12 : baseSize + 12)}
                                                className={(isExceptional) ?  "tl-dot-label-exceptional":  "tl-dot-label"}
                                                textAnchor="middle"
                                                style={{
                                                    fontSize: isHovered ? 17 : 13,

                                                }}
                                            >
                                                {ev.category}
                                            </text>
                                        )}
                                    </g>
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
                                                    fill: 'rgba(255, 255, 255, 0.6)',
                                                    fontSize: '9px',
                                                    fontFamily: 'Rajdhani, monospace',
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase',
                                                    opacity: dim ? 0.38 : 1,
                                                }}
                                            >
                                                ( Click to unlock )
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