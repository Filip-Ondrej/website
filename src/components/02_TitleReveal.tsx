'use client';

import * as React from 'react';
import { LineAnchor } from '@/components/00_LineAnchor';

type Props = {
    className?: string;
    top?: string;
    mid?: string;
    botLeft?: string;
    botGold?: string;
    sectionHeightVH?: number;
    fontScale?: number;
    lineDurationMs?: number;
    bladeDurationMs?: number;
    staggerMs?: number;
    threshold?: number;
    rootMargin?: string;
    titleOffsetBelowLinePx?: number;
};

export default function TitleRevealPro({
                                           className,
                                           top = 'Think You Know What',
                                           mid = '‘Dedicated’',
                                           botLeft = 'Looks Like?',
                                           botGold = 'Watch This.',
                                           sectionHeightVH = 100,
                                           fontScale = 1.15,
                                           lineDurationMs = 1000,
                                           bladeDurationMs = 820,
                                           staggerMs = 160,
                                           threshold = 0.5,
                                           rootMargin = '0px 0px -2% 0px',
                                           titleOffsetBelowLinePx = 100,
                                       }: Props) {
    const wrapRef = React.useRef<HTMLDivElement | null>(null);
    const hasRevealedRef = React.useRef(false);

    React.useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        // start animation when visible
        const start = () => {
            if (hasRevealedRef.current || el.getAttribute('data-reveal') !== '0') return;
            hasRevealedRef.current = true;
            requestAnimationFrame(() => el.setAttribute('data-reveal', '1'));
        };

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    start();
                    io.disconnect();
                }
            },
            { threshold, rootMargin }
        );
        io.observe(el);

        return () => {
            io.disconnect();
        };
    }, [threshold, rootMargin]);

    return (
        <section
            className={`relative ${className ?? ''}`}
            style={{
                height: `${sectionHeightVH}vh`,
                position: 'relative',
                overflow: 'clip',
                isolation: 'isolate',
            }}
        >
            {/* ===== Anchors overlay (fills section) ===== */}
            <div className="pointer-events-none absolute inset-0 z-[10]">
                {/* Top: where the line enters this section */}
                <div className="absolute left-0 top-[40px]">
                    <LineAnchor id="titlereveal-top" position="left" offsetX={100} />
                </div>

                {/* Middle pair: horizontal run - ALWAYS at 50% */}
                <div className="absolute left-0 top-1/2 w-0">
                    <LineAnchor id="titlereveal-left" position="left" offsetX={100} />
                </div>
                <div className="absolute right-0 top-1/2 w-0">
                    <LineAnchor id="titlereveal-right" position="right" offsetX={100} />
                </div>

                {/* Below point: 100px below the middle horizontal line */}
                <div className="absolute left-0 w-0" style={{ top: `calc(50% + 100px)` }}>
                    <LineAnchor id="titlereveal-below" position="right" offsetX={100} />
                </div>

                {/* Bottom: where the line exits this section */}
                <div className="absolute right-0 bottom-[40px]">
                    <LineAnchor id="titlereveal-bottom" position="right" offsetX={100} />
                </div>
            </div>

            {/* Title positioned below the horizontal line */}
            <div
                ref={wrapRef}
                className="trp-wrap"
                data-reveal="0"
                aria-label="Intro title"
                style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: `calc(50% + ${titleOffsetBelowLinePx}px)`,
                    width: '100%',
                    maxWidth: 'min(92vw, 1400px)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                }}
            >
                <div>
                    <h1 className="trp-title">
                        <span className="trp-line trp-small">
                            {top}
                        </span>
                        <span className="trp-line trp-xlarge trp-gold">{mid}</span>
                        <span className="trp-line trp-small">
                            {botLeft} <span className="trp-gold">{botGold}</span>
                        </span>
                    </h1>
                </div>
            </div>

            <style jsx>{`
        .trp-title {
          margin: 0;
          font-family: var(--font-sans, Rajdhani), sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: 0.92;
          color: rgba(255, 255, 255, 0.94);
          font-weight: 900;
          transform: translateZ(0);
        }
        .trp-line {
          display: block;
          margin: 0.04em 0;
          will-change: transform, opacity;
        }

        .trp-small {
          font-weight: 800;
          font-size: calc(${fontScale} * clamp(34px, 4.8vw, 96px));
        }
        .trp-xlarge {
          font-weight: 900;
          font-size: calc(${fontScale} * clamp(72px, 9.6vw, 196px));
        }

        .trp-gold {
          background: linear-gradient(
            135deg,
            #fef3c7 0%,
            #fde047 25%,
            #ffd60a 50%,
            #f59e0b 75%,
            #b45309 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* pre state */
        .trp-wrap[data-reveal='0'] .trp-line {
          opacity: 0;
          transform: translateY(16px) scale(0.982);
        }

        /* split-blade animation */
        .trp-wrap[data-reveal='1'] .trp-line {
          animation: trpBladeRise ${lineDurationMs}ms
            cubic-bezier(0.19, 1, 0.22, 1) forwards;
          position: relative;
          overflow: hidden;
        }
        .trp-wrap[data-reveal='1'] .trp-line:nth-child(2) {
          animation-delay: ${staggerMs}ms;
        }
        .trp-wrap[data-reveal='1'] .trp-line:nth-child(3) {
          animation-delay: ${staggerMs * 2}ms;
        }

        .trp-wrap .trp-line::before,
        .trp-wrap .trp-line::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--color-bg, #0b0b0d);
          z-index: 3;
        }
        .trp-wrap .trp-line::before {
          transform-origin: left center;
          clip-path: polygon(0 0, 52% 0, 48% 100%, 0 100%);
        }
        .trp-wrap .trp-line::after {
          transform-origin: right center;
          clip-path: polygon(52% 0, 100% 0, 100% 100%, 48% 100%);
        }

        .trp-wrap[data-reveal='1'] .trp-line::before {
          animation: trpBladeLeft ${bladeDurationMs}ms
            cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        .trp-wrap[data-reveal='1'] .trp-line::after {
          animation: trpBladeRight ${bladeDurationMs}ms
            cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        .trp-wrap[data-reveal='1'] .trp-line:nth-child(2)::before,
        .trp-wrap[data-reveal='1'] .trp-line:nth-child(2)::after {
          animation-delay: ${staggerMs}ms;
        }

        @keyframes trpBladeRise {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.982);
          }
          65% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes trpBladeLeft {
          to {
            transform: translateX(-100%);
          }
        }
        @keyframes trpBladeRight {
          to {
            transform: translateX(100%);
          }
        }

        @media (max-width: 768px) {
          .trp-wrap {
            max-width: 96vw !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .trp-wrap[data-reveal] .trp-line {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .trp-line::before,
          .trp-line::after {
            display: none !important;
          }
        }
      `}</style>
        </section>
    );
}