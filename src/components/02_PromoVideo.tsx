'use client';

import * as React from 'react';
import { LineAnchor } from '@/components/00_LineAnchor';

type ScrollVideoProps = {
    videoId?: string;
    className?: string;
};

export default function ScrollVideo({
                                        videoId = '6SewsiajtvQ',
                                        className,
                                    }: ScrollVideoProps) {
    const sectionRef = React.useRef<HTMLElement | null>(null);
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        let raf = 0;

        const calc = () => {
            const section = sectionRef.current;
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const vh = window.innerHeight;

            // Animation range: most scroll goes to main growth, quick settle
            const startPoint = vh * 0.5;
            const endPoint = -vh * 0.6; // Main animation completes here

            let rawProgress = 0;
            if (rect.top <= startPoint && rect.top >= endPoint) {
                rawProgress = (startPoint - rect.top) / (startPoint - endPoint);
            } else if (rect.top < endPoint) {
                rawProgress = 1;
            }

            setProgress(rawProgress);
        };

        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(calc);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        calc();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    // ONE smooth curve - no if/else, no phases, no transitions
    // Just pure ease-out
    const eased = 1 - Math.pow(1 - progress, 3);

    const scale = 0.5 + 0.5 * eased;
    const translateY = (1 - eased) * 35;
    const opacity = Math.min(1, progress * 3);

    return (
        <section
            ref={sectionRef}
            className={className}
            style={{
                position: 'relative',
                width: '100%',
                minHeight: '180vh', // Shorter - less dead zone at end
                background: 'var(--color-bg, #0b0b0d)',
            }}
        >
            <div className="absolute top-20">
                <LineAnchor id="promovideo-top" position="right" offsetX={100} />
            </div>
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                }}
            >
                <div
                    className="will-change-transform"
                    style={{
                        width: 'calc(100vw - 300px)',
                        aspectRatio: '16 / 9',
                        transform: `translateY(${translateY}vh) scale(${scale})`,
                        transformOrigin: 'center center',
                        borderRadius: 16,
                        overflow: 'hidden',
                        background: 'black',
                        pointerEvents: 'auto',
                        opacity: opacity,
                    }}
                >
                    <iframe
                        title="Promo video"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&controls=1&modestbranding=1`}
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: 'block',
                        }}
                    />
                </div>
            </div>
            {/* bottom anchor */}
            <div className="absolute bottom-20">
                <LineAnchor id="promovideo-bottom" position="right" offsetX={100} />
            </div>
            <style jsx>{`
        @media (max-width: 1024px) {
          div[style*='width: calc'] {
            width: calc(100vw - 200px) !important;
          }
        }

        @media (max-width: 768px) {
          div[style*='width: calc'] {
            width: calc(100vw - 60px) !important;
            border-radius: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
        </section>
    );
}