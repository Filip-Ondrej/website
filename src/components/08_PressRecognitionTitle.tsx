'use client';

import * as React from 'react';
import clsx from 'clsx';
import { LineAnchor } from '@/components/00_LineAnchor';

export type PressRecognitionTitleProps = {
    lines?: string[];
    height?: number | string;     // section height
    className?: string;
    scale?: number;               // font size multiplier
    leftOffsetPx?: number;        // horizontal offset of the title FROM THE LEFT EDGE
    underOffsetPx?: number;       // px below middle for the “under” point
    reserveBelowPx?: number;      // spacing below the title block
    showAnchors?: boolean;
    debugGuides?: boolean;
};

/* pixels before the anchor where the tunnel opens */
const TUNNEL_OFFSET_PX = 100;

/* for reading globals written by ProgressLine */
interface WindowWithLine extends Window {
    lineAnchors?: Record<string, { x: number; y: number }>;
    progressTipY?: number;
}

/* ================= Styles ================= */
const styles = `
.prt-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  container-type: inline-size;
  isolation: isolate;
  z-index: 1;
}

/* Title block: positioned using top (calc from 50% + offset), LEFT aligned */
.prt-title {
  position: absolute;
  top: var(--prt-under);
  left: var(--prt-left);
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

  --prt-scale: 0.8;
  --prt-left: 200px;
  --prt-size: calc(var(--prt-scale) * clamp(64px, 8.4cqi, 160px));
}
@supports not (font-size: 1cqi) {
  .prt-title { --prt-size: calc(var(--prt-scale) * clamp(64px, 8.4vw, 160px)); }
}

/* Lines inherit the big size */
.prt-line {
  display: block;
  font-size: var(--prt-size);
  overflow: hidden;
}

/* Word slide-up animation */
.prt-word {
  display: inline-block;
  opacity: 0;
  transform: translateY(100%);
  transition:
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--prt-i, 0) * 80ms);
}

/* When visible, all words slide up in sequence */
.prt-title.prt-visible .prt-word {
  opacity: 1;
  transform: translateY(0);
}

/* optional debug guides */
.prt-guide {
  position:absolute;
  left:0;
  right:0;
  height:1px;
  background: rgba(255,255,255,0.25);
  pointer-events:none;
  z-index: 100;
}
.prt-guide--mid    { top: 50%; }
.prt-guide--under  { top: var(--prt-under); }

/* ---------------------- TUNNEL ELLIPSE (TOP) ---------------------- */
.prt-tunnel {
  --prt-tunnel-offset-y: 12px;  /* tiny nudge if you need it */

  position: absolute;
  /* anchor is at right:0 top:42px with offsetX={100}.
     So we put tunnel at top:42px, right:100px and then
     translateY(-50%) to center it vertically on that line point. */
  top: 42px;
  right: 100px;

  width: 90px;                 /* squash these to taste */
  height: 30px;
  border-radius: 999px;
  background: rgba(255,255,255,0.18);

  transform:
    translateX(50%)
    translateY(calc(-50% + var(--prt-tunnel-offset-y)))
    scale(0);
  transform-origin: center center;
  pointer-events: none;
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

/* open state */
.prt-wrap--tunnel-ready .prt-tunnel {
  transform:
    translateX(50%)
    translateY(calc(-50% + var(--prt-tunnel-offset-y)))
    scale(1);
}

@media (max-width: 1024px) {
  .prt-tunnel {
    right: 60px;
    width: 80px;
    height: 28px;
  }
}

@media (max-width: 640px) {
  .prt-tunnel {
    right: 40px;
    width: 72px;
    height: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .prt-word {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .prt-tunnel {
    transition: none !important;
  }
}
`;

export default function PressRecognitionTitle({
                                                  lines = ['PRESS & RECOGNITION'],
                                                  height = 'clamp(360px, 55vh, 640px)',
                                                  className,
                                                  scale = 1,
                                                  leftOffsetPx = 200,
                                                  underOffsetPx = 100,
                                                  reserveBelowPx = 30,
                                                  showAnchors = true,
                                                  debugGuides = false,
                                              }: PressRecognitionTitleProps) {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = React.useState(false);
    const [tunnelReady, setTunnelReady] = React.useState(false);

    // Title animation
    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting) {
                    setVisible(true);
                    io.disconnect();
                }
            },
            { rootMargin: '0px 0px -30% 0px', threshold: 0.5 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Tunnel open/close based on line tip vs prt-start-right-top anchor
    React.useEffect(() => {
        const handleProximity = () => {
            if (typeof window === 'undefined') return;
            const win = window as WindowWithLine;

            const anchors = win.lineAnchors;
            if (!anchors) return;

            const startAnchor = anchors['prt-start-right-top'];
            if (!startAnchor) return;

            const tipY = win.progressTipY;
            if (typeof tipY !== 'number') return;

            // open once tip gets within 100px ABOVE that anchor
            // and stay open while tip is below it;
            // close again when tip moves more than 100px above.
            const shouldBeReady = tipY >= startAnchor.y - TUNNEL_OFFSET_PX;

            setTunnelReady(shouldBeReady);
        };

        handleProximity();
        window.addEventListener('scroll', handleProximity, { passive: true });
        window.addEventListener('anchors-updated', handleProximity);

        return () => {
            window.removeEventListener('scroll', handleProximity);
            window.removeEventListener('anchors-updated', handleProximity);
        };
    }, []);

    const computedHeight = typeof height === 'number' ? `${height}px` : height;

    const allLines = React.useMemo(
        () => lines.map((line) => line.split(' ').filter(Boolean)),
        [lines]
    );

    const wrapperStyle: React.CSSProperties & {
        ['--prt-scale']: string;
        ['--prt-left']: string;
        ['--prt-under']: string;
    } = {
        ['--prt-scale']: String(scale),
        ['--prt-left']: `${leftOffsetPx}px`,
        ['--prt-under']: `calc(50% + ${underOffsetPx}px)`,
    };

    return (
        <>
            <div
                ref={ref}
                className={clsx(
                    'prt-wrap',
                    className,
                    tunnelReady && 'prt-wrap--tunnel-ready'
                )}
                style={{ ...wrapperStyle, height: computedHeight, marginBottom: reserveBelowPx }}
                aria-hidden="true"
            >
                <style>{styles}</style>

                {debugGuides && (
                    <>
                        <div className="prt-guide prt-guide--mid" />
                        <div className="prt-guide prt-guide--under" />
                    </>
                )}

                {showAnchors && (
                    <div className="pointer-events-none absolute inset-0 z-[5]">
                        {/* TOP RIGHT start anchor */}
                        <div className="absolute right-0 top-[42px]">
                            <LineAnchor id="prt-start-right-top" position="right" offsetX={100} />
                        </div>
                        {/* Middle anchors */}
                        <div className="absolute right-0 top-1/2 w-0">
                            <LineAnchor id="prt-middle-right" position="right" offsetX={100} />
                        </div>
                        <div className="absolute left-0 top-1/2 w-0">
                            <LineAnchor id="prt-middle-left" position="left" offsetX={100} />
                        </div>
                        {/* Under + bottom */}
                        <div className="absolute left-0 w-0" style={{ top: 'var(--prt-under)' }}>
                            <LineAnchor id="prt-under-left" position="left" offsetX={100} />
                        </div>
                        <div className="absolute left-0 bottom-[12px]">
                            <LineAnchor id="prt-bottom-left" position="left" offsetX={100} />
                        </div>

                        {/* Tunnel ellipse at the top anchor */}
                        <div className="prt-tunnel" />
                    </div>
                )}

                <h1 className={clsx('prt-title', visible && 'prt-visible')}>
                    {allLines.map((words, lineIdx) => (
                        <span key={lineIdx} className="prt-line">
                            {words.map((word, wordIdx) => {
                                const idx = lineIdx * 10 + wordIdx;
                                const isLast = wordIdx === words.length - 1;

                                return (
                                    <React.Fragment key={`${lineIdx}-${wordIdx}-${word}`}>
                                        <span
                                            className="prt-word"
                                            style={
                                                {
                                                    ['--prt-i']: idx,
                                                } as React.CSSProperties
                                            }
                                        >
                                            {word}
                                        </span>
                                        {!isLast && ' '}
                                    </React.Fragment>
                                );
                            })}
                        </span>
                    ))}
                </h1>
            </div>

            <style jsx global>{``}</style>
        </>
    );
}
