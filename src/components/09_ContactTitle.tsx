'use client';

import * as React from 'react';
import clsx from 'clsx';
import { LineAnchor } from '@/components/00_LineAnchor';

type ContactTitleProps = {
    lines?: string[];
    height?: number | string;     // component's own height
    className?: string;
    scale?: number;               // font size multiplier
    leftOffsetPx?: number;        // horizontal offset of the title
    underOffsetPx?: number;       // px below middle for the "under" point
    reserveBelowPx?: number;      // spacing below the title section
    showAnchors?: boolean;
    debugGuides?: boolean;

    /** typing controls */
    typingMsPerChar?: number;     // default 50–75
    startThreshold?: number;      // IO threshold to start
    startRootMargin?: string;     // IO rootMargin
    startDelayMs?: number;        // delay after intersect
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
            const p =
                1 -
                Math.max(
                    0,
                    Math.min(1, (rect.top - end) / (start - end)),
                );
            setProgress(p);

            const diff = Math.abs(p - lastProgress.current);
            if (diff > 0.005) {
                lastChangeAt.current = Date.now();
                setIsPaused(false);
            } else if (p > 0.01 && p < 0.99) {
                if (Date.now() - lastChangeAt.current > 500)
                    setIsPaused(true);
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
            if (
                p > 0.01 &&
                p < 0.99 &&
                Date.now() - lastChangeAt.current > 500
            )
                setIsPaused(true);
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

function useChasingTypewriter(
    targetChars: number,
    charDelay = 50,
    lockTo?: number,
) {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        const desired = typeof lockTo === 'number' ? lockTo : targetChars;
        if (count === desired) return;

        const typing = desired > count;
        const delay = typing ? charDelay : charDelay / 2;

        const id = window.setInterval(() => {
            setCount((cur) => {
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
.cft-wrap {
  position: relative; width: 100%; height: 100%;
  container-type: inline-size;
  isolation: isolate;
  z-index: 1;
}

/* Title block: positioned using top (calc from 50% + offset) */
.cft-title {
  position: absolute;
  top: var(--cft-under);
  left: var(--cft-left);
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

  --cft-scale: 0.8;
  --cft-left: 200px;
  --cft-size: calc(var(--cft-scale) * clamp(64px, 8.4cqi, 160px));
}
@supports not (font-size: 1cqi) {
  .cft-title { --cft-size: calc(var(--cft-scale) * clamp(64px, 8.4vw, 160px)); }
}

.cft-line { display:block; font-size: var(--cft-size); }

.cft-ch { display:inline-block; opacity:0; }
.cft-ch--v { opacity:1; }

.cft-cur {
  display:inline-block;
  width:3px;
  height:0.9em;
  background: rgba(255,255,255,0.9);
  margin-left:4px;
  vertical-align:middle;
  opacity:0;
}
.cft-cur--typing { opacity:1; animation:none; }
.cft-cur--paused { opacity:1; animation: cftBlink .8s step-end infinite; }
.cft-cur--done   { opacity:1; animation: cftBlink .8s step-end 4, cftFade .6s ease-out 2.5s forwards; }

@keyframes cftBlink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
@keyframes cftFade { to { opacity:0 } }

/* optional debug guides */
.cft-guide {
  position:absolute;
  left:0; right:0;
  height:1px;
  background: rgba(255,255,255,0.25);
  pointer-events:none;
  z-index: 100;
}
.cft-guide--mid    { top: 50%; }
.cft-guide--under  { top: var(--cft-under); }

@media (prefers-reduced-motion: reduce) {
  .cft-cur  { animation: none !important; }
}
`;

export default function ContactTitle({
                                         lines = ["LET'S", 'WORK', 'TOGETHER'],
                                         height = 'clamp(900px, 100vh, 1400px)',
                                         className,
                                         scale = 1,
                                         leftOffsetPx = 200,
                                         underOffsetPx = 100,
                                         reserveBelowPx = 96,
                                         showAnchors = true,
                                         debugGuides = false,

                                         typingMsPerChar = 75,
                                         startThreshold = 0.5,
                                         startRootMargin = '0px 0px -10% 0px',
                                         startDelayMs = 0,
                                     }: ContactTitleProps) {
    const ref = React.useRef<HTMLDivElement | null>(null);

    // gate: start typing once section enters viewport
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
            { threshold: startThreshold, rootMargin: startRootMargin },
        );

        io.observe(el);
        return () => io.disconnect();
    }, [started, startThreshold, startRootMargin, startDelayMs]);

    const { progress, isPaused } = useScrollProgress(ref);
    const gatedProgress = started ? progress : 0;

    const totalChars = React.useMemo(
        () => lines.reduce((s, l) => s + l.length, 0),
        [lines],
    );

    const [lockedComplete, setLockedComplete] = React.useState(false);
    React.useEffect(() => {
        if (!lockedComplete && started && gatedProgress >= 0.8)
            setLockedComplete(true);
    }, [gatedProgress, started, lockedComplete]);

    const targetChars = React.useMemo(
        () =>
            lockedComplete
                ? totalChars
                : Math.floor(gatedProgress * totalChars),
        [gatedProgress, totalChars, lockedComplete],
    );

    const typedChars = useChasingTypewriter(
        targetChars,
        typingMsPerChar,
        lockedComplete ? totalChars : undefined,
    );

    const visible = React.useMemo(() => {
        let remaining = typedChars;
        return lines.map((line) => {
            const c = Math.min(line.length, Math.max(0, remaining));
            remaining -= line.length;
            return c;
        });
    }, [typedChars, lines]);

    const allDone = lockedComplete && typedChars === totalChars;

    const computedHeight =
        typeof height === 'number' ? `${height}px` : height;

    // CSS vars
    const wrapperStyle: React.CSSProperties & {
        ['--cft-scale']: string;
        ['--cft-left']: string;
        ['--cft-under']: string;
    } = {
        ['--cft-scale']: String(scale),
        ['--cft-left']: `${leftOffsetPx}px`,
        ['--cft-under']: `calc(50% + ${underOffsetPx}px)`,
    };

    return (
        <>
            <div
                ref={ref}
                className={clsx('cft-wrap', className)}
                style={{
                    ...wrapperStyle,
                    height: computedHeight,
                    marginBottom: reserveBelowPx,
                }}
                aria-hidden="true"
            >
                <style>{styles}</style>

                {debugGuides && (
                    <>
                        <div className="cft-guide cft-guide--mid" />
                        <div className="cft-guide cft-guide--under" />
                    </>
                )}

                {showAnchors && (
                    <div className="pointer-events-none absolute inset-0 z-[5]">
                        <div className="absolute right-0 top-[12px]">
                            <LineAnchor
                                id="cft-start-right-top"
                                position="right"
                                offsetX={100}
                            />
                        </div>
                        <div className="absolute right-0 top-1/2 w-0">
                            <LineAnchor
                                id="cft-middle-right"
                                position="right"
                                offsetX={100}
                            />
                        </div>
                        <div className="absolute left-0 top-1/2 w-0">
                            <LineAnchor
                                id="cft-middle-left"
                                position="left"
                                offsetX={100}
                            />
                        </div>
                        <div
                            className="absolute left-0 w-0"
                            style={{ top: 'var(--cft-under)' }}
                        >
                            <LineAnchor
                                id="cft-under-left"
                                position="left"
                                offsetX={100}
                            />
                        </div>
                        <div className="absolute left-0 bottom-[12px]">
                            <LineAnchor
                                id="cft-bottom-left"
                                position="left"
                                offsetX={100}
                            />
                        </div>
                    </div>
                )}

                <h1 className="cft-title">
                    {/* Line 1: LET'S */}
                    <span className="cft-line">
                        {lines[0].split('').map((ch, i) => (
                            <React.Fragment key={`l0-${i}`}>
                                <span
                                    className={clsx(
                                        'cft-ch',
                                        i < (visible[0] ?? 0) &&
                                        'cft-ch--v',
                                    )}
                                >
                                    {ch === ' ' ? '\u00A0' : ch}
                                </span>
                                {!allDone &&
                                    i === (visible[0] ?? 0) - 1 &&
                                    typedChars > 0 &&
                                    typedChars <= lines[0].length && (
                                        <span
                                            className={clsx(
                                                'cft-cur',
                                                isPaused
                                                    ? 'cft-cur--paused'
                                                    : 'cft-cur--typing',
                                            )}
                                        />
                                    )}
                            </React.Fragment>
                        ))}
                    </span>

                    {/* Line 2: WORK */}
                    <span className="cft-line">
                        {lines[1].split('').map((ch, i) => (
                            <React.Fragment key={`l1-${i}`}>
                                <span
                                    className={clsx(
                                        'cft-ch',
                                        i < (visible[1] ?? 0) &&
                                        'cft-ch--v',
                                    )}
                                >
                                    {ch === ' ' ? '\u00A0' : ch}
                                </span>
                                {!allDone &&
                                    i === (visible[1] ?? 0) - 1 &&
                                    typedChars > lines[0].length &&
                                    typedChars <=
                                    lines[0].length +
                                    lines[1].length && (
                                        <span
                                            className={clsx(
                                                'cft-cur',
                                                isPaused
                                                    ? 'cft-cur--paused'
                                                    : 'cft-cur--typing',
                                            )}
                                        />
                                    )}
                            </React.Fragment>
                        ))}
                    </span>

                    {/* Line 3: TOGETHER */}
                    <span className="cft-line">
                        {lines[2].split('').map((ch, i) => (
                            <React.Fragment key={`l2-${i}`}>
                                <span
                                    className={clsx(
                                        'cft-ch',
                                        i < (visible[2] ?? 0) &&
                                        'cft-ch--v',
                                    )}
                                >
                                    {ch === ' ' ? '\u00A0' : ch}
                                </span>
                                {!allDone &&
                                    i === (visible[2] ?? 0) - 1 &&
                                    typedChars >
                                    lines[0].length +
                                    lines[1].length &&
                                    typedChars <= totalChars && (
                                        <span
                                            className={clsx(
                                                'cft-cur',
                                                isPaused
                                                    ? 'cft-cur--paused'
                                                    : 'cft-cur--typing',
                                            )}
                                        />
                                    )}
                            </React.Fragment>
                        ))}
                        {allDone && (
                            <span className="cft-cur cft-cur--done" />
                        )}
                    </span>
                </h1>
            </div>

            <style jsx global>{``}</style>
        </>
    );
}
