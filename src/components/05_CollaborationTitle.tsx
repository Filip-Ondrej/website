'use client';

import * as React from 'react';
import clsx from 'clsx';
import { LineAnchor } from '@/components/00_LineAnchor';

export type CollaborationTitleProps = {
    lines?: string[];
    height?: number | string;     // section height
    className?: string;
    scale?: number;               // font size multiplier
    rightOffsetPx?: number;       // horizontal offset of the title FROM THE RIGHT EDGE
    underOffsetPx?: number;       // px below middle for the “under” point
    reserveBelowPx?: number;      // spacing below the title block
    showAnchors?: boolean;
    debugGuides?: boolean;
};

/* ================= Styles ================= */
const styles = `
.ct-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  container-type: inline-size;
  isolation: isolate;
  z-index: 1;
}

/* Title block: positioned using top (calc from 50% + offset) */
.ct-title {
  position: absolute;
  top: var(--ct-under);
  right: var(--ct-right);
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

  --ct-scale: 0.8;
  --ct-right: 200px;
  --ct-size: calc(var(--ct-scale) * clamp(64px, 8.4cqi, 160px));
}
@supports not (font-size: 1cqi) {
  .ct-title { --ct-size: calc(var(--ct-scale) * clamp(64px, 8.4vw, 160px)); }
}

/* Lines inherit the big size */
.ct-line {
  display: block;
  font-size: var(--ct-size);
  overflow: hidden;
}

/* Word slide-up animation */
.ct-word {
  display: inline-block;
  opacity: 0;
  transform: translateY(100%);
  transition:
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--ct-i, 0) * 80ms);
}

/* When visible, all words slide up in sequence */
.ct-title.ct-visible .ct-word {
  opacity: 1;
  transform: translateY(0);
}

/* optional debug guides */
.ct-guide {
  position:absolute;
  left:0;
  right:0;
  height:1px;
  background: rgba(255,255,255,0.25);
  pointer-events:none;
  z-index: 100;
}
.ct-guide--mid    { top: 50%; }
.ct-guide--under  { top: var(--ct-under); }

/* ---------------------- TUNNEL ELLIPSE ---------------------- */
/* smashed-circle around the bottom-right vertical anchor */
.ct-tunnel {
  --ct-tunnel-offset-y: 2px;      /* small downward nudge */

  position: absolute;
  bottom: 12px;                    /* same as ct-bottom-right anchor */
  right: 100px;                    /* matches offsetX={100} */
  width: 90px;                     /* wide + short -> ellipse vibe */
  height: 30px;
  border-radius: 999px;
  background: rgba(255,255,255,0.18);
  transform: translateX(50%) translateY(var(--ct-tunnel-offset-y)) scale(0);
  transform-origin: center center;
  pointer-events: none;
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

@media (max-width: 1024px) {
  .ct-tunnel {
    right: 60px;
    width: 80px;
    height: 28px;
  }
}

@media (max-width: 640px) {
  .ct-tunnel {
    right: 40px;
    width: 72px;
    height: 26px;
  }
}

/* grow / shrink depending on line progress */
.ct-wrap--tunnel-ready .ct-tunnel {
  transform: translateX(50%) translateY(var(--ct-tunnel-offset-y)) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .ct-word {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .ct-tunnel {
    transition: none !important;
  }
}
`;

/** how many px BEFORE the anchor the tunnel opens */
const TUNNEL_OFFSET_PX = 100;

interface WindowWithLine extends Window {
    lineAnchors?: Record<string, { x: number; y: number }>;
    progressTipY?: number;
}

export default function CollaborationTitle({
                                               lines = ['TRUSTED BY THE BEST'],
                                               height = 'clamp(360px, 55vh, 640px)',   // compact section height
                                               className,
                                               scale = 1,
                                               rightOffsetPx = 200,
                                               underOffsetPx = 100,
                                               reserveBelowPx = 30,
                                               showAnchors = true,
                                               debugGuides = false,
                                           }: CollaborationTitleProps) {
    const ref = React.useRef<HTMLDivElement | null>(null);

    const [visible, setVisible] = React.useState(false);
    const [tunnelReady, setTunnelReady] = React.useState(false);

    // Title words: start when this section enters viewport
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

    // Tunnel open/close: based on line tip Y vs ct-bottom-right anchor Y
    React.useEffect(() => {
        const handleProximity = () => {
            if (typeof window === 'undefined') return;
            const win = window as WindowWithLine;

            const anchors = win.lineAnchors;
            if (!anchors) return;

            const bottomAnchor = anchors['ct-bottom-right'];
            if (!bottomAnchor) return;

            const tipY = win.progressTipY;
            if (typeof tipY !== 'number') return;

            // open once the tip gets within 100px ABOVE the anchor,
            // stay open while tip is at/ below that (scrolling down),
            // close only when tip goes back above that threshold.
            const shouldBeReady = tipY >= bottomAnchor.y - TUNNEL_OFFSET_PX;

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

    // Split lines into words for the slide-up animation
    const allLines = React.useMemo(
        () => lines.map((line) => line.split(' ').filter(Boolean)),
        [lines]
    );

    // Shared CSS variables: title positioned from RIGHT
    const wrapperStyle: React.CSSProperties & {
        ['--ct-scale']: string;
        ['--ct-right']: string;
        ['--ct-under']: string;
    } = {
        ['--ct-scale']: String(scale),
        ['--ct-right']: `${rightOffsetPx}px`,
        ['--ct-under']: `calc(50% + ${underOffsetPx}px)`,
    };

    return (
        <>
            <div
                ref={ref}
                className={clsx(
                    'ct-wrap',
                    className,
                    visible && 'ct-wrap--visible',
                    tunnelReady && 'ct-wrap--tunnel-ready'
                )}
                style={{ ...wrapperStyle, height: computedHeight, marginBottom: reserveBelowPx }}
                aria-hidden="true"
            >
                <style>{styles}</style>

                {debugGuides && (
                    <>
                        <div className="ct-guide ct-guide--mid" />
                        <div className="ct-guide ct-guide--under" />
                    </>
                )}

                {showAnchors && (
                    <div className="pointer-events-none absolute inset-0 z-[5]">
                        {/* MIRRORED: start/top on the LEFT */}
                        <div className="absolute left-0 top-[12px]">
                            <LineAnchor id="ct-start-left-top" position="left" offsetX={100} />
                        </div>
                        {/* Middle horizontal line */}
                        <div className="absolute left-0 top-1/2 w-0">
                            <LineAnchor id="ct-middle-left" position="left" offsetX={100} />
                        </div>
                        <div className="absolute right-0 top-1/2 w-0">
                            <LineAnchor id="ct-middle-right" position="right" offsetX={100} />
                        </div>
                        {/* Under anchor on the RIGHT */}
                        <div className="absolute right-0 w-0" style={{ top: 'var(--ct-under)' }}>
                            <LineAnchor id="ct-under-right" position="right" offsetX={100} />
                        </div>
                        {/* Bottom anchor on the RIGHT */}
                        <div className="absolute right-0 bottom-[12px]">
                            <LineAnchor id="ct-bottom-right" position="right" offsetX={100} />
                        </div>

                        {/* Tunnel ellipse around bottom anchor */}
                        <div className="ct-tunnel" />
                    </div>
                )}

                <h1 className={clsx('ct-title', visible && 'ct-visible')}>
                    {allLines.map((words, lineIdx) => (
                        <span key={lineIdx} className="ct-line">
                            {words.map((word, wordIdx) => {
                                const idx = lineIdx * 10 + wordIdx;
                                const isLast = wordIdx === words.length - 1;

                                return (
                                    <React.Fragment key={`${lineIdx}-${wordIdx}-${word}`}>
                                        <span
                                            className="ct-word"
                                            style={
                                                {
                                                    ['--ct-i']: idx,
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
