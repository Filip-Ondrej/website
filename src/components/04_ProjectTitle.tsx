'use client';

import * as React from 'react';
import clsx from 'clsx';
import { LineAnchor } from '@/components/00_LineAnchor';

export type ProjectTitleProps = {
    lines?: string[];
    height?: number | string;     // section height
    className?: string;
    scale?: number;               // font size multiplier
    leftOffsetPx?: number;        // horizontal offset of the title
    underOffsetPx?: number;       // px below middle for the “under” point
    reserveBelowPx?: number;      // spacing below the title block
    showAnchors?: boolean;
    debugGuides?: boolean;
};

/* ================= Styles ================= */
const styles = `
.pt-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  container-type: inline-size;
  isolation: isolate;
  z-index: 1;
}

/* Title block: positioned using top (calc from 50% + offset) */
.pt-title {
  position: absolute;
  top: var(--pt-under);
  left: var(--pt-left);
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

  --pt-scale: 0.8;
  --pt-left: 200px;
  /* SAME SIZE AS TIMELINETITLE */
  --pt-size: calc(var(--pt-scale) * clamp(64px, 8.4cqi, 160px));
}
@supports not (font-size: 1cqi) {
  .pt-title { --pt-size: calc(var(--pt-scale) * clamp(64px, 8.4vw, 160px)); }
}

/* Lines inherit the big size like in tt-line */
.pt-line {
  display: block;
  font-size: var(--pt-size);
  overflow: hidden;
}

/* Word slide-up animation (cinematic title) */
.pt-word {
  display: inline-block;
  opacity: 0;
  transform: translateY(100%);
  transition:
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--pt-i, 0) * 80ms);
}

/* When visible, all words slide up in sequence */
.pt-title.pt-visible .pt-word {
  opacity: 1;
  transform: translateY(0);
}

/* optional debug guides */
.pt-guide {
  position:absolute;
  left:0;
  right:0;
  height:1px;
  background: rgba(255,255,255,0.25);
  pointer-events:none;
  z-index: 100;
}
.pt-guide--mid    { top: 50%; }
.pt-guide--under  { top: var(--pt-under); }

@media (prefers-reduced-motion: reduce) {
  .pt-word {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

export default function ProjectTitle({
                                         lines = ['The Projects That', 'Won World Cups'],
                                         height = 'clamp(600px, 80vh, 1000px)',   // section height (change here if needed)
                                         className,
                                         scale = 1,
                                         leftOffsetPx = 200,
                                         underOffsetPx = 100,
                                         reserveBelowPx = 96,
                                         showAnchors = true,
                                         debugGuides = false,
                                     }: ProjectTitleProps) {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = React.useState(false);

    // Start animation when this section enters viewport
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
            { rootMargin: '0px 0px -35% 0px', threshold: 0.5 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    const computedHeight = typeof height === 'number' ? `${height}px` : height;

    // Split lines into words for the slide-up animation
    const allLines = React.useMemo(
        () => lines.map((line) => line.split(' ').filter(Boolean)),
        [lines]
    );

    // Shared CSS variables - horizontal line ALWAYS at 50%, title positioned relative to it
    const wrapperStyle: React.CSSProperties & {
        ['--pt-scale']: string;
        ['--pt-left']: string;
        ['--pt-under']: string;
    } = {
        ['--pt-scale']: String(scale),
        ['--pt-left']: `${leftOffsetPx}px`,
        ['--pt-under']: `calc(50% + ${underOffsetPx}px)`,
    };

    return (
        <>
            <div
                ref={ref}
                className={clsx('pt-wrap', className)}
                style={{ ...wrapperStyle, height: computedHeight, marginBottom: reserveBelowPx }}
                aria-hidden="true"
            >
                <style>{styles}</style>

                {debugGuides && (
                    <>
                        <div className="pt-guide pt-guide--mid" />
                        <div className="pt-guide pt-guide--under" />
                    </>
                )}

                {showAnchors && (
                    <div className="pointer-events-none absolute inset-0 z-[5]">
                        <div className="absolute right-0 top-[12px]">
                            <LineAnchor id="pt-start-right-top" position="right" offsetX={100} />
                        </div>
                        <div className="absolute right-0 top-1/2 w-0">
                            <LineAnchor id="pt-middle-right" position="right" offsetX={100} />
                        </div>
                        <div className="absolute left-0 top-1/2 w-0">
                            <LineAnchor id="pt-middle-left" position="left" offsetX={100} />
                        </div>
                        <div className="absolute left-0 w-0" style={{ top: 'var(--pt-under)' }}>
                            <LineAnchor id="pt-under-left" position="left" offsetX={100} />
                        </div>
                        <div className="absolute left-0 bottom-[12px]">
                            <LineAnchor id="pt-bottom-left" position="left" offsetX={100} />
                        </div>
                    </div>
                )}

                <h1 className={clsx('pt-title', visible && 'pt-visible')}>
                    {allLines.map((words, lineIdx) => (
                        <span key={lineIdx} className="pt-line">
                            {words.map((word, wordIdx) => {
                                const idx = lineIdx * 10 + wordIdx;
                                const isLast = wordIdx === words.length - 1;

                                return (
                                    <React.Fragment key={`${lineIdx}-${wordIdx}-${word}`}>
                                        <span
                                            className="pt-word"
                                            style={
                                                {
                                                    ['--pt-i']: idx,
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

            <style jsx global>{`
                /* .tl-line--top { display: none !important; } */
            `}</style>
        </>
    );
}
