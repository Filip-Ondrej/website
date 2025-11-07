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

@media (prefers-reduced-motion: reduce) {
  .prt-word {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
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
                                                  reserveBelowPx = 30,          // ← 30px gap UNDER the title
                                                  showAnchors = true,
                                                  debugGuides = false,
                                              }: PressRecognitionTitleProps) {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = React.useState(false);

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
                className={clsx('prt-wrap', className)}
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
                        <div className="absolute right-0 top-[42px]">
                            <LineAnchor id="prt-start-right-top" position="right" offsetX={100} />
                        </div>
                        <div className="absolute right-0 top-1/2 w-0">
                            <LineAnchor id="prt-middle-right" position="right" offsetX={100} />
                        </div>
                        <div className="absolute left-0 top-1/2 w-0">
                            <LineAnchor id="prt-middle-left" position="left" offsetX={100} />
                        </div>
                        <div className="absolute left-0 w-0" style={{ top: 'var(--prt-under)' }}>
                            <LineAnchor id="prt-under-left" position="left" offsetX={100} />
                        </div>
                        <div className="absolute left-0 bottom-[12px]">
                            <LineAnchor id="prt-bottom-left" position="left" offsetX={100} />
                        </div>
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
