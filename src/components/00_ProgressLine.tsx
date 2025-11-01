'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { generateDynamicPath } from '@/lib/00_generateDynamicPath';
import { linePathConfig } from '@/data/00_linePathConfig';

// ====== VISUAL CONFIG ======
const STATIC_LINE_COLOR = 'rgba(255,255,255,0.15)'; // faint baseline
const ACTIVE_LINE_COLOR = 'rgb(255,255,255)';       // animated stroke
const STATIC_LINE_WIDTH = 2;
const ACTIVE_LINE_WIDTH = 4;

// how far ahead (in px) we reveal the gray baseline
const BASELINE_REVEAL_AHEAD = 1000;

// ====== TYPES ======
type AnchorPoint = { x: number; y: number };
type AnchorsMap = Record<string, AnchorPoint>;

type Bubble = {
    startY: number;
    endY: number;
    horizY: number;
    horizWidth: number;
    dropLen: number;
    bubblePathDistance: number;
    bubbleMult: number;
    horizontalSegIndex: number;
    postVerticalSegIndex: number;
    maxOwnedIndex: number;
};

type BubbleRuntimeState = {
    bubble: Bubble | null;
    isActive: boolean;
    scrollMult: number;
};

declare global {
    interface Window {
        lineAnchors?: AnchorsMap;
    }
}

// ====== PURE HELPERS ======
function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}

function dist(a: AnchorPoint, b: AnchorPoint) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Snap lines that are nearly horizontal/vertical so they render crisp
 * (prevents anti-aliased “thin” 1px look on horizontals).
 * For even stroke widths (2, 4), align to integer pixels.
 * For odd widths, align to 0.5 pixels.
 */
function snapForStroke(
    fromX: number, fromY: number,
    toX: number, toY: number,
    strokeW: number
) {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    const halfPixel = (strokeW % 2 === 1) ? 0.5 : 0;

    // Snap “almost horizontal”
    if (dy < 1) {
        const y = Math.round((fromY + toY) * 0.5) + halfPixel;
        return { fromX, fromY: y, toX, toY: y };
    }

    // Snap “almost vertical”
    if (dx < 1) {
        const x = Math.round((fromX + toX) * 0.5) + halfPixel;
        return { fromX: x, fromY, toX: x, toY };
    }

    // Otherwise snap endpoints to integer grid (avoid subpixel jitter)
    return {
        fromX: Math.round(fromX) + halfPixel,
        fromY: Math.round(fromY) + halfPixel,
        toX: Math.round(toX) + halfPixel,
        toY: Math.round(toY) + halfPixel,
    };
}

function segmentIsWithinRevealRange(
    tipY: number,
    fromA: AnchorPoint,
    toA: AnchorPoint,
    aheadPx: number
): boolean {
    const segMinY = Math.min(fromA.y, toA.y);
    return segMinY <= tipY + aheadPx;
}

// Build slowdown “bubbles” for each horizontal+down pair
function computeBubbles(anchors: AnchorsMap | undefined): Bubble[] {
    if (!anchors) return [];

    const bubbles: Bubble[] = [];

    for (let i = 0; i < linePathConfig.length; i++) {
        const seg = linePathConfig[i];
        if (seg.type !== 'horizontal') continue;

        const fromA = anchors[seg.from];
        const toA = anchors[seg.to];
        if (!fromA || !toA) continue;

        const horizWidth = Math.abs(toA.x - fromA.x);
        const horizY = fromA.y;

        // find attached downward leg after this horizontal
        let postVerticalSegIndex = -1;
        let dropLen = 0;

        for (let j = i + 1; j < linePathConfig.length; j++) {
            const seg2 = linePathConfig[j];
            if (seg2.type !== 'vertical') continue;

            const f2 = anchors[seg2.from];
            const t2 = anchors[seg2.to];
            if (!f2 || !t2) continue;

            const startsAtEitherEnd =
                (Math.abs(f2.x - toA.x) < 0.5 && Math.abs(f2.y - toA.y) < 0.5) ||
                (Math.abs(f2.x - fromA.x) < 0.5 && Math.abs(f2.y - fromA.y) < 0.5);

            const goesDown = t2.y > f2.y;

            if (startsAtEitherEnd && goesDown) {
                postVerticalSegIndex = j;
                dropLen = t2.y - f2.y;
                break;
            }
        }

        if (postVerticalSegIndex === -1 || dropLen <= 0.5) continue;

        const bubblePathDistance = horizWidth + dropLen;
        const bubbleMult = bubblePathDistance / dropLen;
        const maxOwnedIndex = Math.max(i, postVerticalSegIndex);

        bubbles.push({
            startY: horizY,
            endY: horizY + dropLen,
            horizY,
            horizWidth,
            dropLen,
            bubblePathDistance,
            bubbleMult,
            horizontalSegIndex: i,
            postVerticalSegIndex,
            maxOwnedIndex,
        });
    }

    bubbles.sort((a, b) => a.startY - b.startY);
    return bubbles;
}

function getActiveBubbleAtY(y: number, bubbles: Bubble[]): Bubble | null {
    for (const b of bubbles) {
        if (y >= b.startY && y <= b.endY) return b;
    }
    return null;
}

function getBubbleBySegIndex(segIndex: number, bubbles: Bubble[]): Bubble | null {
    for (const b of bubbles) {
        if (b.horizontalSegIndex === segIndex || b.postVerticalSegIndex === segIndex) {
            return b;
        }
    }
    return null;
}

/**
 * Treat horizontal + its drop as one conveyor belt:
 * - tip travels downward dropLen px
 * - we reveal bubblePathDistance px (horiz + drop) along that belt
 */
function bubblePathProgress(
    bubble: Bubble,
    tipY: number
): { horizProg: number; vertProg: number } {
    const localY = tipY - bubble.startY;
    const verticalDone = clamp(localY, 0, bubble.dropLen);

    const pathCovered =
        (verticalDone / bubble.dropLen) * bubble.bubblePathDistance;

    const { horizWidth, dropLen } = bubble;

    if (pathCovered <= horizWidth || horizWidth === 0) {
        const horizProg =
            horizWidth === 0 ? 1 : clamp(pathCovered / horizWidth, 0, 1);
        return { horizProg, vertProg: 0 };
    } else {
        const afterHoriz = pathCovered - horizWidth; // distance into vertical leg
        const vertProg = clamp(afterHoriz / dropLen, 0, 1);
        return { horizProg: 1, vertProg };
    }
}

/**
 * While tip is inside a bubble:
 *  - slow scroll so visual cable speed feels steady
 *  - lock future segments past bubble.maxOwnedIndex
 */
function getBubbleRuntimeState(
    tipY: number,
    bubbles: Bubble[]
): BubbleRuntimeState {
    const bubble = getActiveBubbleAtY(tipY, bubbles);

    if (!bubble) return { bubble: null, isActive: false, scrollMult: 1 };

    // if we've basically hit the bottom of the bubble, unlock
    if (tipY >= bubble.endY - 0.5) {
        return { bubble, isActive: false, scrollMult: 1 };
    }

    const baseSlow = 1 / bubble.bubbleMult;
    const scrollMult = clamp(baseSlow, 0.02, 1);

    return { bubble, isActive: true, scrollMult };
}

/**
 * Segment completion percentage at a given tipY.
 */
function getSegmentLogicalProgress(
    segIndex: number,
    tipY: number,
    anchors: AnchorsMap | undefined,
    bubbles: Bubble[]
): number {
    if (!anchors) return 0;

    const cfg = linePathConfig[segIndex];
    const fromA = anchors[cfg.from];
    const toA = anchors[cfg.to];
    if (!cfg || !fromA || !toA) return 0;

    const bubble = getBubbleBySegIndex(segIndex, bubbles);
    if (bubble) {
        if (tipY < bubble.startY) return 0;
        if (tipY >= bubble.endY) return 1;

        const { horizProg, vertProg } = bubblePathProgress(bubble, tipY);
        if (segIndex === bubble.horizontalSegIndex) return horizProg;
        if (segIndex === bubble.postVerticalSegIndex) return vertProg;
        return 0;
    }

    // non-bubble fallback
    const segStartY = Math.min(fromA.y, toA.y);
    const segEndY = Math.max(fromA.y, toA.y);
    const h = segEndY - segStartY;
    if (h === 0) return 1;

    return clamp((tipY - segStartY) / h, 0, 1);
}

/**
 * White cable (active stroke) is never allowed to draw past the tip (downward).
 */
function clampProgressByTip(
    rawProg: number,
    fromA: AnchorPoint,
    toA: AnchorPoint,
    tipY: number
): number {
    const dy = toA.y - fromA.y;

    // horizontal / upward segments can't go "below tip"
    if (Math.abs(dy) < 0.0001) {
        return clamp(rawProg, 0, 1);
    }

    // downward segment: clamp
    if (dy > 0) {
        const startY = fromA.y;
        const revealedY = startY + dy * rawProg;
        if (revealedY > tipY) {
            const allowedDy = tipY - startY;
            const progAllowed = allowedDy / dy;
            return clamp(progAllowed, 0, 1);
        }
    }

    return clamp(rawProg, 0, 1);
}

/**
 * - segment i waits until all segments < i are basically done
 * - during bubble slowdown we don't allow drawing segments beyond that bubble
 */
function canDrawSegment(
    segIndex: number,
    tipY: number,
    anchors: AnchorsMap | undefined,
    bubbles: Bubble[],
    runtime: BubbleRuntimeState
): boolean {
    if (!anchors) return false;

    let maxAllowed = Infinity;
    if (runtime.isActive && runtime.bubble) {
        maxAllowed = runtime.bubble.maxOwnedIndex;
    }
    if (segIndex > maxAllowed) return false;

    for (let i = 0; i < segIndex; i++) {
        if (i <= maxAllowed) {
            const prevProg = getSegmentLogicalProgress(i, tipY, anchors, bubbles);
            if (prevProg < 0.999) return false;
        }
    }

    return true;
}

/**
 * Extend a "virtual" final segment from the last anchor to the bottom of the page.
 */
function getLastAnchorAndBottomTail(
    anchors: AnchorsMap | undefined
): { tailFrom: AnchorPoint | null; tailTo: AnchorPoint | null } {
    if (!anchors) return { tailFrom: null, tailTo: null };

    let deepestId: string | null = null;
    let deepestY = -Infinity;

    for (const [id, pt] of Object.entries(anchors)) {
        if (pt.y > deepestY) {
            deepestY = pt.y;
            deepestId = id;
        }
    }

    if (!deepestId) return { tailFrom: null, tailTo: null };

    const fromA = anchors[deepestId];
    if (!fromA) return { tailFrom: null, tailTo: null };

    const bottomY = document.documentElement.scrollHeight;
    const tailFrom = { x: fromA.x, y: fromA.y };
    const tailTo = { x: fromA.x, y: bottomY };

    if (tailTo.y <= tailFrom.y + 0.5) {
        return { tailFrom: null, tailTo: null };
    }

    return { tailFrom, tailTo };
}

// ====== COMPONENT ======
export function ProgressLine() {
    // where in viewport (0..1) the "tip" sits
    const [viewportPos, setViewportPos] = useState(0);

    // absolute doc-space Y of that tip
    const [tipY, setTipY] = useState(0);

    // bubble runtime state
    const [runtime, setRuntime] = useState<BubbleRuntimeState>({
        bubble: null,
        isActive: false,
        scrollMult: 1,
    });

    // dummy state to force recompute when anchors move
    const [, setPathData] = useState<{
        pathString: string;
        totalLength: number;
        segmentData: {
            length: number;
            scrollMultiplier: number;
            sectionNumber: number;
            type: string;
        }[];
        minY: number;
        maxY: number;
    }>({
        pathString: '',
        totalLength: 0,
        segmentData: [],
        minY: 0,
        maxY: 0,
    });

    // refs
    const pageScrollRef = useRef(0);
    const lastTsRef = useRef<number | null>(null);
    const bubblesRef = useRef<Bubble[]>([]);

    // ---- LAYOUT SYNC ----
    const rebuildAll = useCallback(() => {
        const newPath = generateDynamicPath();
        setPathData(newPath);

        if (typeof window !== 'undefined' && window.lineAnchors) {
            bubblesRef.current = computeBubbles(window.lineAnchors);
        } else {
            bubblesRef.current = [];
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(rebuildAll, 100);
        window.addEventListener('anchors-updated', rebuildAll);
        window.addEventListener('resize', rebuildAll);
        return () => {
            clearTimeout(t);
            window.removeEventListener('anchors-updated', rebuildAll);
            window.removeEventListener('resize', rebuildAll);
        };
    }, [rebuildAll]);

    // ---- SCROLL + RAF LOOP ----
    useEffect(() => {
        let rafId: number;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const maxScroll =
                document.documentElement.scrollHeight - window.innerHeight;

            // tip BEFORE applying this wheel
            const currPageY = pageScrollRef.current;
            const vh = window.innerHeight;
            const docH = document.documentElement.scrollHeight;
            const maxScrollForVP = docH - vh;

            const INTRO = vh * 0.3;
            const OUTRO = vh * 0.3;
            const introEnd = INTRO;
            const normalEnd = maxScrollForVP - OUTRO;

            let vpPosNow = 0;
            if (currPageY <= introEnd) {
                vpPosNow = (currPageY / introEnd) * 0.3;
            } else if (currPageY <= normalEnd) {
                const norm = (currPageY - introEnd) / (normalEnd - introEnd);
                vpPosNow = 0.3 + norm * 0.4;
            } else {
                const outro = (currPageY - normalEnd) / OUTRO;
                vpPosNow = 0.7 + outro * 0.3;
            }
            vpPosNow = clamp(vpPosNow, 0, 1);

            const tipBefore = currPageY + vh * vpPosNow;

            const state = getBubbleRuntimeState(tipBefore, bubblesRef.current);
            setRuntime(state);

            let newPage = pageScrollRef.current + e.deltaY * state.scrollMult;
            newPage = clamp(newPage, 0, maxScroll);

            pageScrollRef.current = newPage;
            window.scrollTo(0, newPage);
        };

        const raf = (ts: number) => {
            if (lastTsRef.current === null) lastTsRef.current = ts;
            lastTsRef.current = ts;

            const pageY = pageScrollRef.current;
            const vh = window.innerHeight;
            const docH = document.documentElement.scrollHeight;
            const maxScrollForVP = docH - vh;

            const INTRO = vh * 0.3;
            const OUTRO = vh * 0.3;
            const introEnd = INTRO;
            const normalEnd = maxScrollForVP - OUTRO;

            let vpPosNow = 0;
            if (pageY <= introEnd) {
                vpPosNow = (pageY / introEnd) * 0.3;
            } else if (pageY <= normalEnd) {
                const norm = (pageY - introEnd) / (normalEnd - introEnd);
                vpPosNow = 0.3 + norm * 0.4;
            } else {
                const outro = (pageY - normalEnd) / OUTRO;
                vpPosNow = 0.7 + outro * 0.3;
            }
            vpPosNow = clamp(vpPosNow, 0, 1);

            setViewportPos(vpPosNow);

            const tipNow = pageY + vh * vpPosNow;
            setTipY(tipNow);

            const st = getBubbleRuntimeState(tipNow, bubblesRef.current);
            setRuntime(st);

            rafId = requestAnimationFrame(raf);
        };

        pageScrollRef.current = window.scrollY;
        lastTsRef.current = null;

        window.addEventListener('wheel', handleWheel, { passive: false });
        rafId = requestAnimationFrame(raf);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            cancelAnimationFrame(rafId);
        };
    }, []);

    const anchors: AnchorsMap | undefined =
        typeof window !== 'undefined' ? window.lineAnchors : undefined;

    if (!anchors) return null;

    // --- INTRO STUB (top filler) ---
    let introFrom: AnchorPoint | null = null;
    let introTo: AnchorPoint | null = null;
    if (linePathConfig.length > 0) {
        const firstCfg = linePathConfig[0];
        const firstA = anchors[firstCfg.from];
        if (firstA) {
            introFrom = { x: firstA.x, y: 0 };
            introTo = { x: firstA.x, y: firstA.y };
        }
    }

    // --- Bottom tail (continue after last anchor) ---
    const { tailFrom, tailTo } = getLastAnchorAndBottomTail(anchors);

    const lastSegIndex = linePathConfig.length - 1;
    function lastSegmentIsDone(): boolean {
        if (lastSegIndex < 0) return false;
        const prog = getSegmentLogicalProgress(
            lastSegIndex,
            tipY,
            anchors,
            bubblesRef.current
        );
        return prog >= 0.999;
    }

    const tailVisible =
        tailFrom &&
        tailTo &&
        segmentIsWithinRevealRange(
            tipY,
            tailFrom,
            tailTo,
            BASELINE_REVEAL_AHEAD
        )
            ? true
            : false;

    const tailAnimatedVisible = tailVisible && lastSegmentIsDone();

    // intro stub active progress (use snapped geometry)
    let introDasharray = 0;
    let introDashoffset = 0;

    // tail active progress (use snapped geometry)
    let tailDasharray = 0;
    let tailDashoffset = 0;

    if (introFrom && introTo) {
        const s = snapForStroke(
            introFrom.x, introFrom.y,
            introTo.x, introTo.y,
            ACTIVE_LINE_WIDTH
        );
        const stubLen = dist({ x: s.fromX, y: s.fromY }, { x: s.toX, y: s.toY });

        const stubRawProg =
            s.toY > s.fromY
                ? clamp((tipY - s.fromY) / (s.toY - s.fromY), 0, 1)
                : 1;

        const stubProgClamped = clampProgressByTip(
            stubRawProg,
            { x: s.fromX, y: s.fromY },
            { x: s.toX, y: s.toY },
            tipY
        );

        introDasharray = stubLen;
        introDashoffset = stubLen * (1 - stubProgClamped);
    }

    if (tailAnimatedVisible && tailFrom && tailTo) {
        const s = snapForStroke(
            tailFrom.x, tailFrom.y,
            tailTo.x, tailTo.y,
            ACTIVE_LINE_WIDTH
        );
        const totalTailY = s.toY - s.fromY;
        const rawTailProg =
            totalTailY > 0 ? clamp((tipY - s.fromY) / totalTailY, 0, 1) : 1;

        const tailProgClamped = clampProgressByTip(
            rawTailProg,
            { x: s.fromX, y: s.fromY },
            { x: s.toX, y: s.toY },
            tipY
        );

        const tailLen = dist({ x: s.fromX, y: s.fromY }, { x: s.toX, y: s.toY });
        tailDasharray = tailLen;
        tailDashoffset = tailLen * (1 - tailProgClamped);
    }

    // ===== RENDER =====
    return (
        <svg
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{
                height: `${document.documentElement.scrollHeight}px`,
                zIndex: 50,
            }}
        >
            <defs>
                <filter id="line-glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* 1. Intro stub baseline (snapped) */}
            {introFrom && introTo && (() => {
                const s = snapForStroke(
                    introFrom.x, introFrom.y,
                    introTo.x, introTo.y,
                    STATIC_LINE_WIDTH
                );
                return (
                    <path
                        d={`M ${s.fromX} ${s.fromY} L ${s.toX} ${s.toY}`}
                        fill="none"
                        stroke={STATIC_LINE_COLOR}
                        strokeWidth={STATIC_LINE_WIDTH}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        shapeRendering="crispEdges"
                    />
                );
            })()}

            {/* 2. Real segments baseline (snapped) */}
            {linePathConfig.map((seg, i) => {
                const fromA = anchors[seg.from];
                const toA = anchors[seg.to];
                if (!fromA || !toA) return null;

                let showBaseline = segmentIsWithinRevealRange(
                    tipY,
                    fromA,
                    toA,
                    BASELINE_REVEAL_AHEAD
                );

                if (i === 0) showBaseline = true;
                if (!showBaseline) return null;

                const s = snapForStroke(
                    fromA.x, fromA.y,
                    toA.x, toA.y,
                    STATIC_LINE_WIDTH
                );

                return (
                    <path
                        key={`baseline-${i}`}
                        d={`M ${s.fromX} ${s.fromY} L ${s.toX} ${s.toY}`}
                        fill="none"
                        stroke={STATIC_LINE_COLOR}
                        strokeWidth={STATIC_LINE_WIDTH}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        shapeRendering="crispEdges"
                    />
                );
            })}

            {/* 3. Tail baseline (snapped) */}
            {tailFrom && tailTo && tailVisible && (() => {
                const s = snapForStroke(
                    tailFrom.x, tailFrom.y,
                    tailTo.x, tailTo.y,
                    STATIC_LINE_WIDTH
                );
                return (
                    <path
                        d={`M ${s.fromX} ${s.fromY} L ${s.toX} ${s.toY}`}
                        fill="none"
                        stroke={STATIC_LINE_COLOR}
                        strokeWidth={STATIC_LINE_WIDTH}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        shapeRendering="crispEdges"
                    />
                );
            })()}

            {/* 4. Intro stub active (snapped) */}
            {introFrom && introTo && (() => {
                const s = snapForStroke(
                    introFrom.x, introFrom.y,
                    introTo.x, introTo.y,
                    ACTIVE_LINE_WIDTH
                );
                const stubLen = dist({ x: s.fromX, y: s.fromY }, { x: s.toX, y: s.toY });
                return (
                    <path
                        d={`M ${s.fromX} ${s.fromY} L ${s.toX} ${s.toY}`}
                        fill="none"
                        stroke={ACTIVE_LINE_COLOR}
                        strokeWidth={ACTIVE_LINE_WIDTH}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        shapeRendering="crispEdges"
                        strokeDasharray={stubLen}
                        strokeDashoffset={introDashoffset}
                        filter="url(#line-glow)"
                    />
                );
            })()}

            {/* 5. Real segments active (snapped) */}
            {linePathConfig.map((seg, index) => {
                const fromA = anchors[seg.from];
                const toA = anchors[seg.to];
                if (!fromA || !toA) return null;

                if (
                    !canDrawSegment(
                        index,
                        tipY,
                        anchors,
                        bubblesRef.current,
                        runtime
                    )
                ) {
                    return null;
                }

                if (index !== 0) {
                    const segStartY = Math.min(fromA.y, toA.y);
                    if (tipY < segStartY) return null;
                }

                const rawProg = getSegmentLogicalProgress(
                    index,
                    tipY,
                    anchors,
                    bubblesRef.current
                );

                const finalProg = clampProgressByTip(
                    rawProg,
                    fromA,
                    toA,
                    tipY
                );

                const s = snapForStroke(
                    fromA.x, fromA.y,
                    toA.x, toA.y,
                    ACTIVE_LINE_WIDTH
                );

                const segLen = dist({ x: s.fromX, y: s.fromY }, { x: s.toX, y: s.toY });
                const dashOffset = segLen * (1 - finalProg);

                return (
                    <path
                        key={`active-${index}`}
                        d={`M ${s.fromX} ${s.fromY} L ${s.toX} ${s.toY}`}
                        fill="none"
                        stroke={ACTIVE_LINE_COLOR}
                        strokeWidth={ACTIVE_LINE_WIDTH}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        shapeRendering="crispEdges"
                        strokeDasharray={segLen}
                        strokeDashoffset={dashOffset}
                        filter="url(#line-glow)"
                    />
                );
            })}

            {/* 6. Tail active (snapped) */}
            {tailFrom && tailTo && tailAnimatedVisible && (() => {
                const s = snapForStroke(
                    tailFrom.x, tailFrom.y,
                    tailTo.x, tailTo.y,
                    ACTIVE_LINE_WIDTH
                );
                const tailLen = dist({ x: s.fromX, y: s.fromY }, { x: s.toX, y: s.toY });
                return (
                    <path
                        d={`M ${s.fromX} ${s.fromY} L ${s.toX} ${s.toY}`}
                        fill="none"
                        stroke={ACTIVE_LINE_COLOR}
                        strokeWidth={ACTIVE_LINE_WIDTH}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        shapeRendering="crispEdges"
                        strokeDasharray={tailLen}
                        strokeDashoffset={tailDashoffset}
                        filter="url(#line-glow)"
                    />
                );
            })()}
        </svg>
    );
}
