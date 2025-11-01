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
    '/images/filip-layer-1.svg',
    '/images/filip-layer-2.svg',
    '/images/filip-layer-3.svg',
    '/images/filip-layer-4.svg',
];

export default function Hero({
                                 title = `I TURN 'IMPOSSIBLE' INTO 'DONE'`,
                                 subtitle = `Filip Ondrej - 10 years competing at robotic World Cups. Now building companies that scale.`,
                                 images = DEFAULT_IMAGES,
                                 className,
                                 aspectRatio = '16 / 9',
                                 fit = 'cover',
                                 parallaxMaxShiftPx = 60,
                             }: HeroProps) {
    const sectionRef = React.useRef<HTMLElement>(null);
    const layersRef = React.useRef<HTMLDivElement[]>([]);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const fadeRef = React.useRef<HTMLDivElement>(null);

    const rafRef = React.useRef(0);
    const lastTimeRef = React.useRef(0);

    React.useEffect(() => {
        const el = sectionRef.current;
        const container = containerRef.current;
        const fade = fadeRef.current;
        const layers = layersRef.current;

        if (!el || !container || !fade) return;

        const REDUCE = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        if (REDUCE) return;

        const FPS_TARGET = 1000 / 60;
        const multipliers = [0, 0.3, 0.7, 1.0];

        let ticking = false;
        let currentProgress = 0;

        const update = () => {
            const scale = 1 + currentProgress * 0.05;
            const opacity = 1 - currentProgress * 0.3;

            container.style.transform = `scale3d(${scale}, ${scale}, 1)`;
            container.style.opacity = String(opacity);

            layers.forEach((layer, i) => {
                if (layer) {
                    const shift = currentProgress * parallaxMaxShiftPx * multipliers[i];
                    layer.style.transform = `translate3d(${shift}px, 0, 0)`;
                }
            });

            fade.style.opacity = String(Math.min(1, currentProgress * 1.8));
            ticking = false;
        };

        const tick = (timestamp: number) => {
            if (timestamp - lastTimeRef.current < FPS_TARGET) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }
            lastTimeRef.current = timestamp;

            const rect = el.getBoundingClientRect();
            const h = rect.height;
            const p = Math.min(1, Math.max(0, -rect.top / h));

            const START = 0.10;
            const raw = (p - START) / (1 - START);
            const clamped = Math.min(1, Math.max(0, raw));

            const eased = clamped * clamped * (3 - 2 * clamped);

            currentProgress = eased;

            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    lastTimeRef.current = performance.now();
                    rafRef.current = requestAnimationFrame(tick);
                } else {
                    cancelAnimationFrame(rafRef.current);
                }
            },
            { root: null, rootMargin: '200px 0px', threshold: 0 }
        );

        io.observe(el);

        return () => {
            cancelAnimationFrame(rafRef.current);
            io.disconnect();
        };
    }, [parallaxMaxShiftPx]);

    const opacities = [1, 0.8, 0.6, 0.4] as const;

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

            {/* Layered artwork */}
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
                {images.map((src, i) => (
                    <div
                        key={i}
                        ref={(el) => {
                            if (el) layersRef.current[i] = el;
                        }}
                        className="absolute inset-0"
                        style={{
                            zIndex: 10 - i,
                            transform: 'translate3d(0, 0, 0)',
                            willChange: 'transform',
                        }}
                        aria-hidden
                    >
                        <Image
                            src={src}
                            alt=""
                            fill
                            priority
                            sizes="100vw"
                            quality={90}
                            style={{
                                objectFit: fit,
                                opacity: opacities[i],
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
                    position: 'absolute',
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