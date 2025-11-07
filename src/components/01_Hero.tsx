'use client';

import Image from 'next/image';
import React from 'react';
import { LineAnchor } from '@/components/00_LineAnchor';

type HeroProps = {
    title?: string;
    subtitle?: string;
    images?: [string, string, string, string];
    className?: string;
    aspectRatio?: `${number} / ${number}`;
    fit?: 'cover' | 'contain';
    parallaxMaxShiftPx?: number;
};

const DEFAULT_IMAGES: [string, string, string, string] = [
    '/images/filip-layer-1.png',
    '/images/filip-layer-2.png',
    '/images/filip-layer-3.png',
    '/images/filip-layer-4.png',
];

export default function Hero({
                                 title = `I TURN 'IMPOSSIBLE' INTO 'DONE'`,
                                 subtitle = `Filip Ondrej - 10 years competing at robotic World Cups. Now building companies that scale.`,
                                 images = DEFAULT_IMAGES,
                                 className,
                                 aspectRatio = '16 / 9',
                                 fit = 'cover',
                                 parallaxMaxShiftPx = 120, // BACK TO 80
                             }: HeroProps) {
    const sectionRef = React.useRef<HTMLElement>(null);
    const layer0Ref = React.useRef<HTMLDivElement>(null);
    const layer1Ref = React.useRef<HTMLDivElement>(null);
    const layer2Ref = React.useRef<HTMLDivElement>(null);
    const layer3Ref = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const fadeRef = React.useRef<HTMLDivElement>(null);

    const rafRef = React.useRef(0);
    const isInViewRef = React.useRef(false);

    React.useEffect(() => {
        const el = sectionRef.current;
        const container = containerRef.current;
        const fade = fadeRef.current;
        const layers = [layer0Ref.current, layer1Ref.current, layer2Ref.current, layer3Ref.current];

        if (!el || !container || !fade || layers.some(l => !l)) return;

        const REDUCE = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        if (REDUCE) return;

        const multipliers = [0, 0.4, 0.9, 1.25];
        let lastScroll = -1;

        const tick = () => {
            if (!isInViewRef.current) return;

            const rect = el.getBoundingClientRect();
            const scrollProgress = Math.min(1, Math.max(0, -rect.top / rect.height));

            // Skip if no change
            if (Math.abs(scrollProgress - lastScroll) < 0.005) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }
            lastScroll = scrollProgress;

            // Start effects earlier (at 5% instead of 15%)
            const START = 0.05;
            const adjusted = Math.min(1, Math.max(0, (scrollProgress - START) / (1 - START)));

            // Zoom and fade container
            const scale = 1 + adjusted * 0.15;
            const opacity = 1 - adjusted * 0.5;
            container.style.transform = `scale3d(${scale}, ${scale}, 1)`;
            container.style.opacity = String(opacity);

            // Parallax layers
            layers.forEach((layer, i) => {
                if (layer) {
                    const shift = scrollProgress * parallaxMaxShiftPx * multipliers[i];
                    layer.style.transform = `translate3d(${shift}px, 0, 0)`;
                }
            });

            // Bottom fade – start earlier, independent of container zoom
            const FADE_START = 0.05;   // when the fade should begin (0 = immediately)
            const FADE_END = 0.35;    // how far into the scroll it should be fully opaque
            const fadeProgress = Math.min(
                1,
                Math.max(0, (scrollProgress - FADE_START) / (FADE_END - FADE_START))
            );
            fade.style.opacity = String(fadeProgress);

            rafRef.current = requestAnimationFrame(tick);
        };

        const io = new IntersectionObserver(
            (entries) => {
                isInViewRef.current = entries[0].isIntersecting;
                if (isInViewRef.current) {
                    rafRef.current = requestAnimationFrame(tick);
                } else {
                    cancelAnimationFrame(rafRef.current);
                }
            },
            { root: null, rootMargin: '100px 0px', threshold: 0 }
        );

        io.observe(el);

        return () => {
            cancelAnimationFrame(rafRef.current);
            io.disconnect();
        };
    }, [parallaxMaxShiftPx]);

    return (
        <section
            ref={sectionRef}
            className={['relative w-screen overflow-hidden', className ?? ''].join(' ')}
            style={{
                aspectRatio,
                isolation: 'isolate',
                backgroundColor: 'var(--color-bg, #0b0b0d)',
            }}
            aria-label="Hero"
        >
            {/* anchors */}
            <div className="pointer-events-none absolute top-20 left-0 z-50">
                <LineAnchor id="hero-top" position="left" offsetX={100} />
            </div>

            {/* Layered artwork with zoom/fade container */}
            <div
                ref={containerRef}
                className="absolute inset-0"
                style={{
                    transform: 'scale3d(1, 1, 1)',
                    opacity: 1,
                    willChange: 'transform, opacity',
                    transformOrigin: 'center center',
                }}
            >
                {[layer0Ref, layer1Ref, layer2Ref, layer3Ref].map((ref, i) => (
                    <div
                        key={i}
                        ref={ref}
                        className="absolute inset-0"
                        style={{
                            zIndex: 10 - i,
                            transform: 'translate3d(0, 0, 0)',
                            willChange: 'transform',
                        }}
                        aria-hidden
                    >
                        <Image
                            src={images[i]}
                            alt=""
                            fill
                            priority
                            sizes="100vw"
                            quality={95}
                            style={{
                                objectFit: fit,
                                opacity: 1 - (i * 0.2),
                                pointerEvents: 'none',
                            }}
                            loading="eager"
                        />
                    </div>
                ))}
            </div>

            {/* Bottom fade */}
            <div
                ref={fadeRef}
                className="pointer-events-none absolute left-0 right-0 bottom-0"
                style={{
                    height: '30%',
                    background: 'linear-gradient(to bottom, transparent 0%, var(--color-bg, #0b0b0d) 100%)',
                    zIndex: 20,
                    opacity: 0,
                    willChange: 'opacity',
                }}
            />

            {/* Title block */}
            <div
                className="pointer-events-none absolute z-30"
                style={{
                    left: '200px',
                    bottom: '300px',
                    maxWidth: '1200px',
                }}
            >
                <div
                    className="subtitleSize"
                    style={{
                        color: 'var(--color-muted)',
                        textShadow: '0 1px 12px rgba(0,0,0,0.4)',
                        marginBottom: 'var(--space-xs)',
                    }}
                >
                    [00] Introduction
                </div>

                <h1
                    className="text-balance"
                    style={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'rgba(255,255,255,0.96)',
                        lineHeight: 0.95,
                        textShadow: '0 2px 24px rgba(0,0,0,0.5)',
                    }}
                    aria-label={title}
                >
          <span className="titleLine titleSize" style={{ display: 'block' }}>
            I TURN &apos;IMPOSSIBLE&apos;
          </span>
                    <span className="titleLine titleSize" style={{ display: 'block' }}>
            INTO &apos;DONE&apos;
          </span>
                </h1>

                {subtitle && (
                    <p
                        className="subtitleSize"
                        style={{
                            marginTop: 'var(--space-sm)',
                            color: 'var(--color-muted)',
                            textShadow: '0 1px 12px rgba(0,0,0,0.4)',
                            maxWidth: '800px',
                        }}
                    >
                        Filip Ondrej - 10 years competing at robotic World Cups.<br />
                        Now building companies that scale.
                    </p>
                )}
            </div>

            <style jsx>{`
        .titleSize { 
          font-size: clamp(68px, 6.6vw, 92px); 
        }
        .subtitleSize { 
          font-size: clamp(16px, 2.1vw, 22px); 
        }

        @media (max-width: 768px) {
          div[style*="left: 200px"] {
            left: 20px !important;
          }
          div[style*="bottom: 300px"] {
            bottom: 100px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          div[style*="willChange"] {
            will-change: auto !important;
            transform: none !important;
          }
        }
      `}</style>

            <div className="pointer-events-none absolute bottom-20 left-0 z-50">
                <LineAnchor id="hero-bottom" position="left" offsetX={100} />
            </div>
        </section>
    );
}