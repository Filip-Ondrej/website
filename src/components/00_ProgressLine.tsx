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

// ====== HELPERS ======

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}

function dist(a: AnchorPoint, b: AnchorPoint) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
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

// Build slowdown "bubbles" for each horizontal+down pair
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
        if (
            b.horizontalSegIndex === segIndex ||
            b.postVerticalSegIndex === segIndex
        ) {
            return b;
        }
    }
    return null;
}

/**
 * bubblePathProgress
 * Treat horizontal + its drop as one conveyor belt.
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
        const afterHoriz = pathCovered - horizWidth;
        const vertProg = clamp(afterHoriz / dropLen, 0, 1);
        return { horizProg: 1, vertProg };
    }
}

/**
 * getBubbleRuntimeState
 * While tip is inside a bubble:
 *  - scroll is slowed via scrollMult in wheel handler
 *  - we also use bubble.maxOwnedIndex to lock future segments
 */
function getBubbleRuntimeState(
    tipY: number,
    bubbles: Bubble[]
): BubbleRuntimeState {
    const bubble = getActiveBubbleAtY(tipY, bubbles);

    if (!bubble) {
        return { bubble: null, isActive: false, scrollMult: 1 };
    }

    // if we've basically hit the bottom of the bubble, unlock
    if (tipY >= bubble.endY - 0.5) {
        return { bubble, isActive: false, scrollMult: 1 };
    }

    const baseSlow = 1 / bubble.bubbleMult;
    const scrollMult = clamp(baseSlow, 0.02, 1);

    return {
        bubble,
        isActive: true,
        scrollMult,
    };
}

/**
 * getSegmentLogicalProgress
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
 * clampProgressByTip
 * White cable (active stroke) is never allowed to "draw past" the tip.
 */
function clampProgressByTip(
    rawProg: number,
    fromA: AnchorPoint,
    toA: AnchorPoint,
    tipY: number
): number {
    const dy = toA.y - fromA.y;

    // horizontal / upward segments can't go "below tip", so raw is fine
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
 * canDrawSegment
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
            if (prevProg < 0.999) {
                return false;
            }
        }
    }

    return true;
}

/**
 * getLastAnchorAndBottomTail
 */
function getLastAnchorAndBottomTail(
    anchors: AnchorsMap | undefined
): { tailFrom: AnchorPoint | null; tailTo: AnchorPoint | null } {
    if (!anchors) {
        return { tailFrom: null, tailTo: null };
    }

    let deepestId: string | null = null;
    let deepestY = -Infinity;

    for (const [id, pt] of Object.entries(anchors)) {
        if (pt.y > deepestY) {
            deepestY = pt.y;
            deepestId = id;
        }
    }

    if (!deepestId) {
        return { tailFrom: null, tailTo: null };
    }

    const fromA = anchors[deepestId];
    if (!fromA) {
        return { tailFrom: null, tailTo: null };
    }

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
    const [, setViewportPos] = useState(0);
    const [tipY, setTipY] = useState(0);
    const [runtime, setRuntime] = useState<BubbleRuntimeState>({
        bubble: null,
        isActive: false,
        scrollMult: 1,
    });

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

    const lastTsRef = useRef<number | null>(null);
    const bubblesRef = useRef<Bubble[]>([]);

    // canonical scroll used by wheel handler (with bubble slowdown)
    const pageScrollRef = useRef(0);
    const wheelScrollingRef = useRef(false);

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

    // ---- SCROLL + RAF LOOP (original behavior + bubble slowdown, no smoothing) ----
    useEffect(() => {
        let rafId: number;

        const computeViewportPos = (pageY: number) => {
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
            return clamp(vpPosNow, 0, 1);
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const vh = window.innerHeight;
            const docH = document.documentElement.scrollHeight;
            const maxScroll = docH - vh;

            const currPageY = pageScrollRef.current;
            const vpPosNow = computeViewportPos(currPageY);
            const tipBefore = currPageY + vh * vpPosNow;

            const state = getBubbleRuntimeState(tipBefore, bubblesRef.current);
            setRuntime(state);

            // clamp delta a bit so we don't jump crazy amounts
            const rawDelta = e.deltaY;
            const delta = clamp(rawDelta, -150, 150);

            let newPage = currPageY + delta * state.scrollMult;
            newPage = clamp(newPage, 0, maxScroll);

            pageScrollRef.current = newPage;
            wheelScrollingRef.current = true;
            window.scrollTo(0, newPage);
        };

        const handleScroll = () => {
            if (wheelScrollingRef.current) {
                wheelScrollingRef.current = false;
                return;
            }
            const current = window.scrollY || window.pageYOffset || 0;
            pageScrollRef.current = current;
        };

        const raf = (ts: number) => {
            if (lastTsRef.current === null) lastTsRef.current = ts;
            lastTsRef.current = ts;

            const pageY = pageScrollRef.current;
            const vh = window.innerHeight;

            const vpPosNow = computeViewportPos(pageY);
            setViewportPos(vpPosNow);

            const tipNow = pageY + vh * vpPosNow;
            setTipY(tipNow);

            const st = getBubbleRuntimeState(tipNow, bubblesRef.current);
            setRuntime(st);

            rafId = requestAnimationFrame(raf);
        };

        // init scroll ref
        const initial = window.scrollY || window.pageYOffset || 0;
        pageScrollRef.current = initial;
        lastTsRef.current = null;

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('scroll', handleScroll, { passive: true });
        rafId = requestAnimationFrame(raf);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafId);
        };
    }, []);

    // grab anchors from window
    const anchors: AnchorsMap | undefined =
        typeof window !== 'undefined' ? window.lineAnchors : undefined;

    if (!anchors) {
        return null;
    }

    // --- INTRO STUB ---
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

    // --- Bottom tail ---
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

    let tailDasharray = 0;
    let tailDashoffset = 0;
    if (tailAnimatedVisible && tailFrom && tailTo) {
        const totalTailY = tailTo.y - tailFrom.y;
        const rawTailProg =
            totalTailY > 0 ? clamp((tipY - tailFrom.y) / totalTailY, 0, 1) : 1;

        const tailProgClamped = clampProgressByTip(
            rawTailProg,
            tailFrom,
            tailTo,
            tipY
        );

        const tailLen = dist(tailFrom, tailTo);
        tailDasharray = tailLen;
        tailDashoffset = tailLen * (1 - tailProgClamped);
    }

    // intro stub animated progress
    let introDasharray = 0;
    let introDashoffset = 0;
    if (introFrom && introTo) {
        const stubLen = dist(introFrom, introTo);

        const stubRawProg =
            introTo.y > introFrom.y
                ? clamp((tipY - introFrom.y) / (introTo.y - introFrom.y), 0, 1)
                : 1;

        const stubProgClamped = clampProgressByTip(
            stubRawProg,
            introFrom,
            introTo,
            tipY
        );

        introDasharray = stubLen;
        introDashoffset = stubLen * (1 - stubProgClamped);
    }

    const svgHeight = document.documentElement.scrollHeight;

    return (
        <svg
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{
                height: `${svgHeight}px`,
                zIndex: 50,
            }}
        >
            {/* 1. Intro stub baseline */}
            {introFrom && introTo && (
                <path
                    d={`M ${introFrom.x} ${introFrom.y} L ${introTo.x} ${introTo.y}`}
                    fill="none"
                    stroke={STATIC_LINE_COLOR}
                    strokeWidth={STATIC_LINE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            )}

            {/* 2. Real segments baseline */}
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

                if (i === 0) {
                    showBaseline = true;
                }

                if (!showBaseline) return null;

                return (
                    <path
                        key={`baseline-${i}`}
                        d={`M ${fromA.x} ${fromA.y} L ${toA.x} ${toA.y}`}
                        fill="none"
                        stroke={STATIC_LINE_COLOR}
                        strokeWidth={STATIC_LINE_WIDTH}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                );
            })}

            {/* 3. Tail baseline */}
            {tailFrom && tailTo && tailVisible && (
                <path
                    d={`M ${tailFrom.x} ${tailFrom.y} L ${tailTo.x} ${tailTo.y}`}
                    fill="none"
                    stroke={STATIC_LINE_COLOR}
                    strokeWidth={STATIC_LINE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            )}

            {/* 4. Intro stub active */}
            {introFrom && introTo && (
                <path
                    d={`M ${introFrom.x} ${introFrom.y} L ${introTo.x} ${introTo.y}`}
                    fill="none"
                    stroke={ACTIVE_LINE_COLOR}
                    strokeWidth={ACTIVE_LINE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={introDasharray}
                    strokeDashoffset={introDashoffset}
                    vectorEffect="non-scaling-stroke"
                />
            )}

            {/* 5. Real segments active */}
            {linePathConfig.map((seg, index) => {
                const fromA = anchors[seg.from];
                const toA = anchors[seg.to];
                if (!fromA || !toA) return null;

                // gating: segment can't animate if future-locked by bubble
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

                // don't animate a future segment until tip reached its Y,
                // except index 0 which can start immediately.
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

                if (finalProg <= 0) {
                    return null;
                }

                const segLen = dist(fromA, toA);
                if (segLen <= 0) return null;

                const dashArray = segLen;
                const dashOffset = segLen * (1 - finalProg);

                return (
                    <path
                        key={`active-${index}`}
                        d={`M ${fromA.x} ${fromA.y} L ${toA.x} ${toA.y}`}
                        fill="none"
                        stroke={ACTIVE_LINE_COLOR}
                        strokeWidth={ACTIVE_LINE_WIDTH}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        vectorEffect="non-scaling-stroke"
                    />
                );
            })}

            {/* 6. Tail active */}
            {tailFrom && tailTo && tailAnimatedVisible && (
                <path
                    d={`M ${tailFrom.x} ${tailFrom.y} L ${tailTo.x} ${tailTo.y}`}
                    fill="none"
                    stroke={ACTIVE_LINE_COLOR}
                    strokeWidth={ACTIVE_LINE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={tailDasharray}
                    strokeDashoffset={tailDashoffset}
                    vectorEffect="non-scaling-stroke"
                />
            )}
        </svg>
    );
}