'use client';

import * as React from 'react';
import { LineAnchor } from '@/components/00_LineAnchor';

type ScrollVideoProps = {
    backgroundVideoUrl?: string;
    fullscreenVideoUrl?: string;
    className?: string;
};

export default function ScrollVideo({
                                        backgroundVideoUrl = 'https://vimeo.com/1132746110',
                                        fullscreenVideoUrl = 'https://vimeo.com/1132746110',
                                        className,
                                    }: ScrollVideoProps) {
    const sectionRef = React.useRef<HTMLElement | null>(null);
    const [progress, setProgress] = React.useState(0);
    const [isHovering, setIsHovering] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const fullscreenIframeRef = React.useRef<HTMLIFrameElement>(null);
    const backdropRef = React.useRef<HTMLDivElement>(null);

    // Extract Vimeo ID from URL
    const getVimeoId = (url: string) => {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : '';
    };

    const backgroundVideoId = getVimeoId(backgroundVideoUrl);
    const fullscreenVideoId = getVimeoId(fullscreenVideoUrl);

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

    // Handle fullscreen modal and auto-close on video end
    React.useEffect(() => {
        if (!isFullscreen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsFullscreen(false);
            }
        };

        // Lock body scroll (preserve page position)
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        // Setup Vimeo listener for video end AND fullscreen changes
        const setupVimeoListener = () => {
            if (fullscreenIframeRef.current && window.Vimeo) {
                const player = new window.Vimeo.Player(fullscreenIframeRef.current);

                player.on('ended', () => {
                    setIsFullscreen(false);
                });

                // Listen for when Vimeo's native fullscreen is exited
                player.on('fullscreenchange', (data: { fullscreen: boolean }) => {
                    if (!data.fullscreen) {
                        // Vimeo fullscreen was exited, recalculate line positions
                        requestAnimationFrame(() => {
                            window.dispatchEvent(new Event('scroll'));
                            window.dispatchEvent(new Event('resize'));
                        });
                    }
                });
            }
        };

        if (!window.Vimeo) {
            const script = document.createElement('script');
            script.src = 'https://player.vimeo.com/api/player.js';
            script.onload = setupVimeoListener;
            document.body.appendChild(script);
        } else {
            setupVimeoListener();
        }

        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('keydown', handleEsc);

            // Reset styles
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';

            // Restore scroll position
            window.scrollTo(0, scrollY);

            // FORCE the ProgressLine to update by triggering scroll event
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollY); // Ensure it's still at the right position
                window.dispatchEvent(new Event('scroll')); // Trigger scroll event
                window.dispatchEvent(new Event('resize')); // Also trigger resize event

                // Double-check after another frame
                requestAnimationFrame(() => {
                    window.scrollTo(0, scrollY);
                    window.dispatchEvent(new Event('scroll'));
                    window.dispatchEvent(new Event('resize'));
                });
            });
        };
    }, [isFullscreen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) {
            setIsFullscreen(false);
        }
    };

    // ONE smooth curve - no if/else, no phases, no transitions
    // Just pure ease-out
    const eased = 1 - Math.pow(1 - progress, 3);

    const scale = 0.5 + 0.5 * eased;
    const translateY = (1 - eased) * 35;
    const opacity = Math.min(1, progress * 3);

    return (
        <>
            <section
                ref={sectionRef}
                className={className}
                style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '180vh',
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
                        className="video-container will-change-transform"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        onClick={() => setIsFullscreen(true)}
                        style={{
                            width: 'calc(100vw - 300px)',
                            aspectRatio: '16 / 9',
                            transform: `translateY(${translateY}vh) scale(${scale})`,
                            transformOrigin: 'center center',
                            borderRadius: 0,
                            overflow: 'hidden',
                            background: 'black',
                            pointerEvents: 'auto',
                            opacity: opacity,
                            cursor: 'pointer',
                            position: 'relative',
                        }}
                    >
                        {/* Background looping video */}
                        <iframe
                            title="Background video"
                            src={`https://player.vimeo.com/video/${backgroundVideoId}?background=1&autoplay=1&loop=1&autopause=0&muted=1`}
                            allow="autoplay; fullscreen; picture-in-picture"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                display: 'block',
                                pointerEvents: 'none',
                            }}
                        />

                        {/* Play button overlay */}
                        <div
                            className={`play-overlay ${isHovering ? 'visible' : ''}`}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0, 0, 0, 0.4)',
                                opacity: isHovering ? 1 : 0,
                                transition: 'opacity 0.3s ease',
                                pointerEvents: 'none',
                            }}
                        >
                            <svg
                                className="play-icon"
                                viewBox="0 0 100 100"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    width: '200px',
                                    height: '200px',
                                    filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
                                    transform: isHovering ? 'scale(1)' : 'scale(0.8)',
                                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                }}
                            >
                                <defs>
                                    <filter id="softGlow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <path
                                    d="M 25 15 L 25 85 L 85 50 Z"
                                    fill="white"
                                    opacity="0.9"
                                    filter="url(#softGlow)"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
                {/* bottom anchor */}
                <div className="absolute bottom-20">
                    <LineAnchor id="promovideo-bottom" position="right" offsetX={100} />
                </div>
            </section>

            {/* Fullscreen video modal */}
            {isFullscreen && (
                <div
                    ref={backdropRef}
                    className="fullscreen-modal"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.98)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.3s ease-out',
                        backdropFilter: 'blur(10px)',
                    }}
                    onClick={handleBackdropClick}
                    onWheel={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                >
                    <div className="lightbox-container">
                        {/* Fullscreen video */}
                        <div
                            style={{
                                width: '90vw',
                                maxWidth: '1600px',
                                aspectRatio: '16 / 9',
                            }}
                        >
                            <iframe
                                ref={fullscreenIframeRef}
                                title="Fullscreen video"
                                src={`https://player.vimeo.com/video/${fullscreenVideoId}?autoplay=1`}
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                            />
                        </div>

                        {/* Close button - positioned OUTSIDE the video container */}
                        <button
                            className="close-btn"
                            onClick={() => setIsFullscreen(false)}
                            aria-label="Close"
                        >
                            <span className="close-line" />
                            <span className="close-line" />
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .lightbox-container {
                    position: relative;
                    max-width: 90vw;
                    max-height: 90vh;
                    animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .close-btn {
                    position: absolute;
                    top: -50px;
                    right: -50px;
                    width: 44px;
                    height: 44px;
                    background: rgba(0, 0, 0, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    backdrop-filter: blur(10px);
                }

                .close-btn:hover {
                    background: rgba(0, 0, 0, 0.9);
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: rotate(90deg);
                }

                .close-line {
                    position: absolute;
                    width: 20px;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.9);
                    transition: background 0.3s ease;
                }

                .close-btn:hover .close-line {
                    background: #ffffff;
                }

                .close-line:first-child {
                    transform: rotate(45deg);
                }

                .close-line:last-child {
                    transform: rotate(-45deg);
                }

                /* Hide Vimeo controls and branding */
                .video-container :global(iframe) {
                    pointer-events: auto;
                }

                /* Force hide Vimeo UI elements */
                :global(.vp-sidedock),
                :global(.vp-overlay),
                :global(.vp-controls-wrapper),
                :global(.vp-badge),
                :global(.vp-logo),
                :global(.vp-title),
                :global(.vp-byline),
                :global(.vp-portrait) {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                }

                @media (max-width: 1024px) {
                    .video-container {
                        width: calc(100vw - 200px) !important;
                    }
                    
                    .close-btn {
                        top: 20px;
                        right: 20px;
                    }
                }

                @media (max-width: 768px) {
                    .video-container {
                        width: calc(100vw - 60px) !important;
                        border-radius: 0;
                    }

                    .close-btn {
                        top: 10px !important;
                        right: 10px !important;
                        width: 40px !important;
                        height: 40px !important;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}</style>
        </>
    );
}

// TypeScript declaration for Vimeo Player API
declare global {
    interface Window {
        Vimeo?: {
            Player: new (iframe: HTMLIFrameElement) => {
                on: (event: string, callback: (data: { fullscreen: boolean }) => void) => void;
            };
        };
    }
}