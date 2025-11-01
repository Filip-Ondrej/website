'use client';

import * as React from 'react';
import { LineAnchor } from '@/components/00_LineAnchor';

type Props = {
    className?: string;
    top?: string;
    mid?: string;
    botLeft?: string;
    botGold?: string;
    sectionMinHeightVH?: number;
    padBotVH?: number;
    fontScale?: number;
    lineDurationMs?: number;
    bladeDurationMs?: number;
    staggerMs?: number;
    threshold?: number;
    rootMargin?: string;
    midPercent?: number;
    underTitleOffsetPx?: number;
};

export default function TitleRevealPro({
                                           className,
                                           top = 'Think You Know What',
                                           mid = '‘Dedicated’',
                                           botLeft = 'Looks Like?',
                                           botGold = 'Watch This.',
                                           sectionMinHeightVH = 100,
                                           padBotVH = 16,
                                           fontScale = 1.15,
                                           lineDurationMs = 1000,
                                           bladeDurationMs = 820,
                                           staggerMs = 160,
                                           threshold = 0.5,
                                           rootMargin = '0px 0px -2% 0px',
                                           midPercent = 50,
                                           underTitleOffsetPx = 100,
                                       }: Props) {
    const sectionRef = React.useRef<HTMLElement | null>(null);
    const wrapRef    = React.useRef<HTMLDivElement | null>(null);
    const titleRef   = React.useRef<HTMLDivElement | null>(null);
    const firstLineRef = React.useRef<HTMLSpanElement | null>(null);

    const hasRevealedRef = React.useRef(false);
    const resizeTimeoutRef = React.useRef<number | null>(null);

    // extra px we subtract so the first line's top sits exactly at (mid% + under)
    const [topAdjustPx, setTopAdjustPx] = React.useState(0);

    React.useEffect(() => {
        const el = wrapRef.current;
        const section = sectionRef.current;
        const title = titleRef.current;
        const first = firstLineRef.current;
        if (!el || !section || !title || !first) return;

        const measureInnerOffset = () => {
            // offsetTop is transform-free and includes margins; good for alignment
            const inner = first.offsetTop || 0;
            // we want wrapperTop = desiredTop - inner
            setTopAdjustPx(-inner);
        };

        const recomputeHeight = () => {
            if (resizeTimeoutRef.current !== null) {
                window.clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = window.setTimeout(() => {
                const vh = window.innerHeight || 0;
                const baseMin  = (sectionMinHeightVH / 100) * vh;
                const bottomPad = (padBotVH / 100) * vh;
                const midFrac = Math.min(0.95, Math.max(0.05, midPercent / 100));
                const titleH = title.offsetHeight;

                // H >= mid*H + under + titleH + bottomPad  ⇒  H >= (under+titleH+bottomPad)/(1−mid)
                const need = (underTitleOffsetPx + titleH + bottomPad) / (1 - midFrac);
                const finalH = Math.max(baseMin, need);
                section.style.height = `${Math.ceil(finalH)}px`;
            }, 80);
        };

        // initial pass
        measureInnerOffset();
        recomputeHeight();

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

        const onResize = () => {
            measureInnerOffset();
            recomputeHeight();
        };

        window.addEventListener('resize', onResize, { passive: true });

        // in case fonts load later or content wraps differently
        const ro = new ResizeObserver(() => {
            measureInnerOffset();
            recomputeHeight();
        });
        ro.observe(title);

        return () => {
            io.disconnect();
            window.removeEventListener('resize', onResize);
            ro.disconnect();
            if (resizeTimeoutRef.current !== null) window.clearTimeout(resizeTimeoutRef.current);
        };
    }, [
        threshold,
        rootMargin,
        midPercent,
        underTitleOffsetPx,
        sectionMinHeightVH,
        padBotVH,
    ]);

    const horizontalY = `${midPercent}%`;
    // wrapper top uses + topAdjustPx to align first line visually 100px under the run
    const titleTop = `calc(${midPercent}% + ${underTitleOffsetPx + topAdjustPx}px)`;

    return (
        <section
            ref={sectionRef}
            className={`relative ${className ?? ''}`}
            style={{
                minHeight: `${sectionMinHeightVH}vh`,
                position: 'relative',
                overflow: 'clip',
                isolation: 'isolate',
            }}
        >
            {/* line path in the empty top half */}
            <div className="pointer-events-none absolute inset-0 z-[10]">
                <div className="absolute left-0 top-[40px]">
                    <LineAnchor id="titlereveal-top" position="left" offsetX={100} />
                </div>
                <div className="absolute left-0 w-0" style={{ top: horizontalY }}>
                    <LineAnchor id="titlereveal-left" position="left" offsetX={100} />
                </div>
                <div className="absolute right-0 w-0" style={{ top: horizontalY }}>
                    <LineAnchor id="titlereveal-right" position="right" offsetX={100} />
                </div>
                <div className="absolute left-0 w-0" style={{ top: `calc(${horizontalY} + 100px)` }}>
                    <LineAnchor id="titlereveal-below" position="right" offsetX={100} />
                </div>
                <div className="absolute right-0 bottom-[40px]">
                    <LineAnchor id="titlereveal-bottom" position="right" offsetX={100} />
                </div>
            </div>

            {/* title 100px below the horizontal run (first line aligned) */}
            <div
                ref={wrapRef}
                className="trp-wrap"
                data-reveal="0"
                aria-label="Intro title"
                style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: titleTop,
                    width: '100%',
                    maxWidth: 'min(92vw, 1400px)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                }}
            >
                <div ref={titleRef}>
                    <h1 className="trp-title">
                        <span ref={firstLineRef} className="trp-line trp-small">{top}</span>
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
                .trp-line { display: block; margin: 0.04em 0; will-change: transform, opacity; }

                .trp-small  { font-weight: 800; font-size: calc(${fontScale} * clamp(34px, 4.8vw, 96px)); }
                .trp-xlarge { font-weight: 900; font-size: calc(${fontScale} * clamp(72px, 9.6vw, 196px)); }

                .trp-gold {
                    background: linear-gradient(135deg,#fef3c7 0%,#fde047 25%,#ffd60a 50%,#f59e0b 75%,#b45309 100%);
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
                    animation: trpBladeRise ${lineDurationMs}ms cubic-bezier(0.19, 1, 0.22, 1) forwards;
                    position: relative; overflow: hidden;
                }
                .trp-wrap[data-reveal='1'] .trp-line:nth-child(2) { animation-delay: ${staggerMs}ms; }
                .trp-wrap[data-reveal='1'] .trp-line:nth-child(3) { animation-delay: ${staggerMs * 2}ms; }

                .trp-wrap .trp-line::before,
                .trp-wrap .trp-line::after {
                    content: ''; position: absolute; inset: 0; background: var(--color-bg, #0b0b0d); z-index: 3;
                }
                .trp-wrap .trp-line::before { transform-origin: left center;  clip-path: polygon(0 0,52% 0,48% 100%,0 100%); }
                .trp-wrap .trp-line::after  { transform-origin: right center; clip-path: polygon(52% 0,100% 0,100% 100%,48% 100%); }

                .trp-wrap[data-reveal='1'] .trp-line::before {
                    animation: trpBladeLeft ${bladeDurationMs}ms cubic-bezier(0.19, 1, 0.22, 1) forwards;
                }
                .trp-wrap[data-reveal='1'] .trp-line::after {
                    animation: trpBladeRight ${bladeDurationMs}ms cubic-bezier(0.19, 1, 0.22, 1) forwards;
                }
                .trp-wrap[data-reveal='1'] .trp-line:nth-child(2)::before,
                .trp-wrap[data-reveal='1'] .trp-line:nth-child(2)::after { animation-delay: ${staggerMs}ms; }

                @keyframes trpBladeRise { 0%{opacity:0;transform:translateY(16px) scale(0.982)} 65%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes trpBladeLeft  { to { transform: translateX(-100%); } }
                @keyframes trpBladeRight { to { transform: translateX(100%); } }

                @media (max-width: 768px) {
                    .trp-wrap { max-width: 96vw !important; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .trp-wrap[data-reveal] .trp-line { animation: none !important; opacity: 1 !important; transform: none !important; }
                    .trp-line::before, .trp-line::after { display: none !important; }
                }
            `}</style>
        </section>
    );
}
