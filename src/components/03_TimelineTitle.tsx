'use client';

import * as React from 'react';
import clsx from 'clsx';
import { LineAnchor } from '@/components/00_LineAnchor';

type TitleHeaderProps = {
    lines?: string[];
    height?: number | string;     // component's own height - REDUCED default
    className?: string;
    scale?: number;               // font size multiplier
    leftOffsetPx?: number;        // horizontal offset of the title
    underOffsetPx?: number;       // px below middle for the "under" point (default 100)
    reserveBelowPx?: number;      // real spacing below the title section to separate timeline (default 96)
    showAnchors?: boolean;
    debugGuides?: boolean;

    /** NEW — typing controls */
    typingMsPerChar?: number;     // default 50
    startThreshold?: number;      // IntersectionObserver threshold to start (default 0.35)
    startRootMargin?: string;     // IO rootMargin (default '0px 0px -10% 0px')
    startDelayMs?: number;        // optional start delay after intersect (default 0)
};

function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
    const [progress, setProgress] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
    const lastProgress = React.useRef(0);
    const lastChangeAt = React.useRef<number>(Date.now());

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let rafId: number | null = null;

        const tick = () => {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            const start = vh - 150;
            const end = vh * 0.4;
            const p = 1 - Math.max(0, Math.min(1, (rect.top - end) / (start - end)));
            setProgress(p);

            const diff = Math.abs(p - lastProgress.current);
            if (diff > 0.005) {
                lastChangeAt.current = Date.now();
                setIsPaused(false);
            } else if (p > 0.01 && p < 0.99) {
                if (Date.now() - lastChangeAt.current > 500) setIsPaused(true);
            }
            lastProgress.current = p;
            rafId = null;
        };

        const onScroll = () => {
            if (rafId != null) return;
            rafId = requestAnimationFrame(tick);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        const intervalId = window.setInterval(() => {
            const p = lastProgress.current;
            if (p > 0.01 && p < 0.99 && Date.now() - lastChangeAt.current > 500) setIsPaused(true);
        }, 120);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            window.clearInterval(intervalId);
        };
    }, [ref]);

    return { progress, isPaused };
}

function useChasingTypewriter(targetChars: number, charDelay = 50, lockTo?: number) {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        const desired = typeof lockTo === 'number' ? lockTo : targetChars;
        if (count === desired) return;

        const typing = desired > count;
        const delay = typing ? charDelay : charDelay / 2;

        const id = window.setInterval(() => {
            setCount(cur => {
                if (typing) {
                    const next = cur + 1;
                    return next >= desired ? desired : next;
                } else {
                    const next = cur - 1;
                    return next <= desired ? desired : next;
                }
            });
        }, delay);

        return () => window.clearInterval(id);
    }, [targetChars, charDelay, count, lockTo]);

    return count;
}

/* ================= Styles ================= */
const styles = `
.tt-wrap {
  position: relative; width: 100%; height: 100%;
  container-type: inline-size;
  isolation: isolate;
  z-index: 1;
}

/* Title block: positioned using top (calc from 50% + offset) */
.tt-title {
  position: absolute;
  top: var(--tt-under);
  left: var(--tt-left);
  margin: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.04em;

  font-family: var(--font-sans, Rajdhani), monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 0.92;
  color: rgba(255,255,255,0.94);
  font-weight: 900;
  pointer-events: none;

  --tt-scale: 0.8;
  --tt-left: 200px;
  --tt-size: calc(var(--tt-scale) * clamp(64px, 8.4cqi, 160px));
}
@supports not (font-size: 1cqi) {
  .tt-title { --tt-size: calc(var(--tt-scale) * clamp(64px, 8.4vw, 160px)); }
}

.tt-line { display:block; font-size: var(--tt-size); }

.tt-gold {
  background: linear-gradient(135deg,#FEF3C7 0%,#FDE047 25%,#FFD60A 50%,#F59E0B 75%,#B45309 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 12px rgba(255,214,10,0.35));
  animation: ttGoldShimmer 3s ease-in-out infinite;
}
@keyframes ttGoldShimmer { 0%,100%{filter:drop-shadow(0 0 8px rgba(255,214,10,0.4))} 50%{filter:drop-shadow(0 0 12px rgba(255,214,10,0.6))} }

.tt-ch { display:inline-block; opacity:0; }
.tt-ch--v { opacity:1; }

.tt-cur { display:inline-block; width:3px; height:0.9em; background: rgba(255,255,255,0.9); margin-left:4px; vertical-align:middle; opacity:0; }
.tt-cur--typing { opacity:1; animation:none; }
.tt-cur--paused { opacity:1; animation: ttBlink .8s step-end infinite; }
.tt-cur--done   { opacity:1; animation: ttBlink .8s step-end 4, ttFade .6s ease-out 2.5s forwards; }
@keyframes ttBlink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
@keyframes ttFade { to { opacity:0 } }

/* optional debug guides */
.tt-guide { position:absolute; left:0; right:0; height:1px; background: rgba(255,255,255,0.25); pointer-events:none; z-index: 100; }
.tt-guide--mid    { top: 50%; }
.tt-guide--under  { top: var(--tt-under); }

@media (prefers-reduced-motion: reduce) {
  .tt-gold { animation: none !important; }
  .tt-cur  { animation: none !important; }
}
`;

export default function TimelineTitle({
                                          lines = ['Every Lesson.', 'Every Pivot.', 'Every Win.'],
                                          height = 'clamp(900px, 100vh, 1400px)',
                                          className,
                                          scale = 1,
                                          leftOffsetPx = 200,
                                          underOffsetPx = 100,
                                          reserveBelowPx = 96,
                                          showAnchors = true,
                                          debugGuides = false,

                                          // NEW defaults
                                          typingMsPerChar = 75,
                                          startThreshold = 0.5,
                                          startRootMargin = '0px 0px -10% 0px',
                                          startDelayMs = 0,
                                      }: TitleHeaderProps) {
    const ref = React.useRef<HTMLDivElement | null>(null);

    // Start gate: begin typing only once the section actually enters the viewport
    const [started, setStarted] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current;
        if (!el || started) return;

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    const fire = () => setStarted(true);
                    if (startDelayMs > 0) {
                        window.setTimeout(fire, startDelayMs);
                    } else {
                        fire();
                    }
                    io.disconnect();
                }
            },
            { threshold: startThreshold, rootMargin: startRootMargin }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [started, startThreshold, startRootMargin, startDelayMs]);

    const { progress, isPaused } = useScrollProgress(ref);
    const gatedProgress = started ? progress : 0;

    const totalChars = React.useMemo(
        () => lines.reduce((s, l) => s + l.length, 0),
        [lines]
    );

    // One-time completion at 80% of gated progress
    const [lockedComplete, setLockedComplete] = React.useState(false);
    React.useEffect(() => {
        if (!lockedComplete && started && gatedProgress >= 0.8) setLockedComplete(true);
    }, [gatedProgress, started, lockedComplete]);

    const targetChars = React.useMemo(
        () => (lockedComplete ? totalChars : Math.floor(gatedProgress * totalChars)),
        [gatedProgress, totalChars, lockedComplete]
    );

    const typedChars = useChasingTypewriter(
        targetChars,
        typingMsPerChar,
        lockedComplete ? totalChars : undefined
    );

    const visible = React.useMemo(() => {
        let remaining = typedChars;
        return lines.map(line => {
            const c = Math.min(line.length, Math.max(0, remaining));
            remaining -= line.length;
            return c;
        });
    }, [typedChars, lines]);

    const allDone = lockedComplete && typedChars === totalChars;

    const computedHeight = typeof height === 'number' ? `${height}px` : height;

    // Shared CSS variables - horizontal line ALWAYS at 50%, title positioned relative to it
    const wrapperStyle: React.CSSProperties & {
        ['--tt-scale']: string;
        ['--tt-left']: string;
        ['--tt-under']: string;
    } = {
        ['--tt-scale']: String(scale),
        ['--tt-left']: `${leftOffsetPx}px`,
        ['--tt-under']: `calc(50% + ${underOffsetPx}px)`,
    };

    return (
        <>
            <div
                ref={ref}
                className={clsx('tt-wrap', className)}
                style={{ ...wrapperStyle, height: computedHeight, marginBottom: reserveBelowPx }}
                aria-hidden="true"
            >
                <style>{styles}</style>

                {debugGuides && (
                    <>
                        <div className="tt-guide tt-guide--mid" />
                        <div className="tt-guide tt-guide--under" />
                    </>
                )}

                {/* Anchors: horizontal line ALWAYS at 50% (top-1/2) */}
                {showAnchors && (
                    <div className="pointer-events-none absolute inset-0 z-[5]">
                        <div className="absolute right-0 top-[12px]">
                            <LineAnchor id="tt-start-right-top" position="right" offsetX={100} />
                        </div>
                        {/* Middle horizontal line - FIXED at 50% */}
                        <div className="absolute right-0 top-1/2 w-0">
                            <LineAnchor id="tt-middle-right" position="right" offsetX={100} />
                        </div>
                        <div className="absolute left-0 top-1/2 w-0">
                            <LineAnchor id="tt-middle-left" position="left" offsetX={100} />
                        </div>
                        {/* Under anchor - positioned relative to 50% */}
                        <div className="absolute left-0 w-0" style={{ top: 'var(--tt-under)' }}>
                            <LineAnchor id="tt-under-left" position="left" offsetX={100} />
                        </div>
                        <div className="absolute left-0 bottom-[12px]">
                            <LineAnchor id="tt-bottom-left" position="left" offsetX={100} />
                        </div>
                    </div>
                )}

                {/* Title (top positioned via calc(50% + offset)) */}
                <h1 className="tt-title">
                    {/* Line 1 */}
                    <span className="tt-line">
                        {lines[0].split('').map((ch, i) => (
                            <React.Fragment key={`l0-${i}`}>
                                <span className={clsx('tt-ch', i < (visible[0] ?? 0) && 'tt-ch--v')}>
                                    {ch === ' ' ? '\u00A0' : ch}
                                </span>
                                {/* Show cursor right after this character if it's the last visible one */}
                                {!allDone &&
                                    i === (visible[0] ?? 0) - 1 &&
                                    typedChars > 0 &&
                                    typedChars <= lines[0].length && (
                                        <span className={clsx('tt-cur', isPaused ? 'tt-cur--paused' : 'tt-cur--typing')} />
                                    )}
                            </React.Fragment>
                        ))}
                    </span>

                    {/* Line 2 */}
                    <span className="tt-line">
                        {lines[1].split('').map((ch, i) => (
                            <React.Fragment key={`l1-${i}`}>
                                <span className={clsx('tt-ch', i < (visible[1] ?? 0) && 'tt-ch--v')}>
                                    {ch === ' ' ? '\u00A0' : ch}
                                </span>
                                {/* Show cursor right after this character if it's the last visible one */}
                                {!allDone &&
                                    i === (visible[1] ?? 0) - 1 &&
                                    typedChars > lines[0].length &&
                                    typedChars <= lines[0].length + lines[1].length && (
                                        <span className={clsx('tt-cur', isPaused ? 'tt-cur--paused' : 'tt-cur--typing')} />
                                    )}
                            </React.Fragment>
                        ))}
                    </span>

                    {/* Line 3 — gold */}
                    <span className={clsx('tt-line', 'tt-gold')}>
                        {lines[2].split('').map((ch, i) => (
                            <React.Fragment key={`l2-${i}`}>
                                <span className={clsx('tt-ch', i < (visible[2] ?? 0) && 'tt-ch--v')}>
                                    {ch === ' ' ? '\u00A0' : ch}
                                </span>
                                {/* Show cursor right after this character if it's the last visible one */}
                                {!allDone &&
                                    i === (visible[2] ?? 0) - 1 &&
                                    typedChars > lines[0].length + lines[1].length &&
                                    typedChars <= totalChars && (
                                        <span className={clsx('tt-cur', isPaused ? 'tt-cur--paused' : 'tt-cur--typing')} />
                                    )}
                            </React.Fragment>
                        ))}
                        {/* Final cursor animation when done */}
                        {allDone && <span className="tt-cur tt-cur--done" />}
                    </span>
                </h1>
            </div>

            {/* OPTIONAL: mute the timeline's top rule if it still peeks under the title */}
            <style jsx global>{`
                /* .tl-line--top { display: none !important; } */
            `}</style>
        </>
    );
}