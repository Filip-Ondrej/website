'use client';

import React from 'react';

type Props = {
    loopVideoId?: string;
    mainVideoId?: string;
    className?: string;
};

export default function PromoVideo({
                                       loopVideoId = '6SewsiajtvQ',
                                       mainVideoId = '_T8Ft80lDcY',
                                       className,
                                   }: Props) {
    const loopRef = React.useRef<HTMLIFrameElement>(null);
    const mainRef = React.useRef<HTMLIFrameElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const [isMainOpen, setIsMainOpen] = React.useState(false);
    const [loopReady, setLoopReady] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);

    const ambientOn = loopReady && !isMainOpen && isVisible;

    // Intersection observer for performance
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Initialize loop video when visible
    React.useEffect(() => {
        if (isVisible && loopRef.current && !loopReady) {
            setLoopReady(true);
        }
    }, [isVisible, loopReady]);

    const openMain = () => {
        setIsMainOpen(true);
        console.log('Video opened');
    };

    const closeMain = () => {
        console.log('Closing video');
        setIsMainOpen(false);
        // Reload iframe to stop video
        if (mainRef.current) {
            const src = mainRef.current.src;
            mainRef.current.src = '';
            mainRef.current.src = src;
        }
    };

    // ESC key handler
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMainOpen) {
                closeMain();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMainOpen]);

    return (
        <section
            ref={containerRef}
            className={`promo-video ${className ?? ''}`}
            aria-label="Promo video section"
        >
            <div className="loop-wrap">
                {isVisible && (
                    <iframe
                        ref={loopRef}
                        className="loop-video"
                        src={`https://www.youtube.com/embed/${loopVideoId}?autoplay=1&mute=1&loop=1&playlist=${loopVideoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&enablejsapi=1&rel=0`}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title="Background loop video"
                    />
                )}

                {/* Ambient lights - only when main video is NOT open */}
                {!isMainOpen && (
                    <div className="ambient-glow" aria-hidden="true" />
                )}

                <div className={`frame ${ambientOn ? 'on' : ''}`} aria-hidden="true">
                    <div className="inner-shadow" />
                    <div className="bottom-fade" />
                </div>

                {!isMainOpen && (
                    <button className="play-cta" onClick={openMain} aria-label="Play promo video">
                        <svg viewBox="0 0 80 80" className="play-icon" aria-hidden="true">
                            <path d="M30 20 L30 60 L60 40 Z" fill="white" />
                        </svg>
                    </button>
                )}
            </div>

            <div className={`player ${isMainOpen ? 'open' : ''}`} role="dialog" aria-label="Promo video player">
                <button className="close" onClick={closeMain} aria-label="Close video">
                    <span />
                    <span />
                </button>

                {isMainOpen && (
                    <iframe
                        ref={mainRef}
                        className="main-video"
                        src={`https://www.youtube.com/embed/${mainVideoId}?autoplay=1&controls=1&modestbranding=1&playsinline=1&rel=0&fs=1`}
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                        title="Promo video"
                    />
                )}
            </div>

            <style jsx>{`
                .promo-video {

                    position: relative;
                    padding: 120px 16px;
                    display: grid;
                    place-items: center;
                    overflow: clip;
                    font-family: 'Rajdhani', monospace;
                    contain: layout style paint;
                }

                /* Ambient system - ONLY around video frame */
                .ambient {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1);
                    will-change: opacity;
                    max-width: min(1200px, 92vw);
                    aspect-ratio: 16 / 9;
                    margin: auto;
                }
                .ambient.on { opacity: 1; }

                /* Film grain - contained to video area */
                .ambient::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.07'/></svg>");
                    background-size: 320px 320px;
                    mix-blend-mode: overlay;
                    opacity: 0.85;
                    border-radius: 22px;
                }

                /* Light sweeps - dynamic ambient around frame */
                .ambient::after {
                    content: '';
                    position: absolute;
                    inset: -8%;
                    background:
                        radial-gradient(circle at 20% 30%, rgba(100, 170, 255, 0.3), transparent 40%),
                        radial-gradient(circle at 80% 70%, rgba(255, 120, 60, 0.25), transparent 40%),
                        radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.08), transparent 35%),
                        radial-gradient(circle at 10% 80%, rgba(100, 170, 255, 0.2), transparent 35%),
                        radial-gradient(circle at 90% 20%, rgba(255, 120, 60, 0.18), transparent 35%);
                    filter: blur(40px);
                    animation: ambientFlow 8s ease-in-out infinite;
                    opacity: 0.85;
                    mix-blend-mode: screen;
                    will-change: transform;
                    border-radius: 28px;
                }

                /* Ambient glow around background video */
                .ambient-glow {
                    position: absolute;
                    inset: -12%;
                    border-radius: 36px;
                    background:
                        radial-gradient(circle at 20% 30%, rgba(100, 170, 255, 0.3), transparent 40%),
                        radial-gradient(circle at 80% 70%, rgba(255, 120, 60, 0.25), transparent 40%),
                        radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.08), transparent 35%),
                        radial-gradient(circle at 10% 80%, rgba(100, 170, 255, 0.2), transparent 35%),
                        radial-gradient(circle at 90% 20%, rgba(255, 120, 60, 0.18), transparent 35%);
                    filter: blur(40px);
                    animation: ambientFlow 8s ease-in-out infinite;
                    opacity: 0.85;
                    mix-blend-mode: screen;
                    pointer-events: none;
                    z-index: -1;
                }

                @keyframes ambientFlow {
                    0% { 
                        transform: translate3d(0, 0, 0) scale(1);
                        opacity: 0.85;
                    }
                    25% { 
                        transform: translate3d(2%, -1%, 0) scale(1.05) rotate(1deg);
                        opacity: 0.95;
                    }
                    50% { 
                        transform: translate3d(-1%, 2%, 0) scale(1.02) rotate(-0.5deg);
                        opacity: 0.9;
                    }
                    75% { 
                        transform: translate3d(-2%, -1%, 0) scale(1.04) rotate(0.5deg);
                        opacity: 0.88;
                    }
                    100% { 
                        transform: translate3d(0, 0, 0) scale(1);
                        opacity: 0.85;
                    }
                }

                /* Video container */
                .loop-wrap {
                    position: relative;
                    width: min(1200px, 92vw);
                    aspect-ratio: 16 / 9;
                    border-radius: 22px;
                    overflow: hidden;
                    box-shadow:
                        0 0 0 1px rgba(255, 255, 255, 0.08),
                        0 30px 100px rgba(0,0,0,0.6);
                    isolation: isolate;
                    will-change: transform;
                    transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
                    contain: layout style paint;
                }

                .loop-wrap:hover {
                    transform: translateY(-2px);
                }

                /* YouTube iframe optimization */
                .loop-video {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    border: none;
                    pointer-events: none;
                    transform: translateZ(0);
                    backface-visibility: hidden;
                }

                /* Frame effects */
                .frame {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1);
                }
                .frame.on { opacity: 1; }

                .inner-shadow {
                    position: absolute;
                    inset: 0;
                    border-radius: 22px;
                    box-shadow:
                        inset 0 0 0 1px rgba(255, 255, 255, 0.16),
                        inset 0 60px 180px rgba(0,0,0,0.65),
                        inset 0 -80px 220px rgba(0,0,0,0.65);
                }

                .bottom-fade {
                    position: absolute;
                    left: 0; right: 0; bottom: 0; height: 38%;
                    background: linear-gradient(180deg, transparent, rgba(0,0,0,0.9));
                }

                /* Simple white play button */
                .play-cta {
                    position: absolute;
                    inset: 0;
                    display: grid;
                    place-items: center;
                    border: none;
                    background: none;
                    cursor: pointer;
                    z-index: 10;
                }

                .play-icon {
                    width: 80px;
                    height: 80px;
                    opacity: 0.8;
                    transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
                    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
                }

                .play-cta:hover .play-icon {
                    opacity: 1;
                    transform: scale(1.1);
                }

                /* Main player overlay - no ambient lights */
                .player {
                    position: fixed;
                    inset: 0;
                    display: grid;
                    place-items: center;
                    background: transparent;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 50;
                    backdrop-filter: blur(20px);
                }

                .player.open {
                    opacity: 1;
                    pointer-events: auto;
                }

                /* Main video */
                .main-video {
                    width: min(1200px, 92vw);
                    aspect-ratio: 16 / 9;
                    background: #000;
                    border-radius: 16px;
                    border: none;
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,0.08),
                        0 30px 120px rgba(0,0,0,0.85);
                    outline: none;
                }

                /* Close button */
                .close {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    width: 44px; 
                    height: 44px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.18);
                    background: rgba(255,255,255,0.06);
                    color: white;
                    cursor: pointer;
                    display: grid;
                    place-items: center;
                    backdrop-filter: blur(8px);
                    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 60;
                }

                .close:hover {
                    transform: translateY(-1px) scale(1.05);
                    border-color: rgb(255, 215, 0);
                    background: rgba(255, 215, 0, 0.12);
                }

                .close span {
                    position: absolute;
                    width: 18px; 
                    height: 2px;
                    background: rgba(255,255,255,0.9);
                    transition: background 200ms cubic-bezier(0.16, 1, 0.3, 1);
                }

                .close:hover span {
                    background: rgb(255, 215, 0);
                }

                .close span:first-child { transform: rotate(45deg); }
                .close span:last-child  { transform: rotate(-45deg); }

                /* Mobile */
                @media (max-width: 640px) {
                    .promo-video { padding: 80px 12px; }
                    .play-icon { width: 60px; height: 60px; }
                    .close { top: 16px; right: 16px; width: 40px; height: 40px; }
                }

                /* Reduced motion */
                @media (prefers-reduced-motion: reduce) {
                    .ambient-glow { animation: none !important; }
                    .loop-wrap:hover,
                    .play-cta:hover .play-icon { transform: none; }
                }
            `}</style>
        </section>
    );
}