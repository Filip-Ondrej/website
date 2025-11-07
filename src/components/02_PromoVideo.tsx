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
        const setupVimeoListener = () => {
            if (fullscreenIframeRef.current && window.Vimeo) {
                const player = new window.Vimeo.Player(fullscreenIframeRef.current);
                player.on('ended', () => {
                    setIsFullscreen(false);
                });
            }
        };

        if (isFullscreen) {
            // Store current scroll position
            const scrollY = window.scrollY;

            // Lock body scroll with fixed positioning
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';

            // Load Vimeo Player API and listen for video end
            if (!window.Vimeo) {
                const script = document.createElement('script');
                script.src = 'https://player.vimeo.com/api/player.js';
                script.onload = () => {
                    setupVimeoListener();
                };
                document.body.appendChild(script);
            } else {
                setupVimeoListener();
            }
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';

            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('keydown', handleEsc);
            // Clean up on unmount
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

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
                            borderRadius: 16,
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
                                    d="M 32 19
                                       Q 27.91 17.68 25 21
                                       L 25 79
                                       Q 27.91 82.32 32 81
                                       L 85 52.5
                                       Q 88 50 85 47.5
                                       Z"
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
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsFullscreen(false);
                        }
                    }}
                >
                    {/* Close button */}
                    <button
                        className="close-btn"
                        onClick={() => setIsFullscreen(false)}
                        aria-label="Close"
                    >
                        <div className="close-icon">
                            <span className="close-line first" />
                            <span className="close-line second" />
                        </div>
                    </button>

                    {/* Fullscreen video */}
                    <div
                        style={{
                            width: '90vw',
                            /*height: '90vh',*/
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
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .close-btn {
                    position: fixed;
                    top: 32px;
                    right: 32px;
                    width: 48px;
                    height: 48px;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 10001;
                }

                .close-icon {
                    position: relative;
                    width: 20px;
                    height: 20px;
                    margin: auto;
                }

                .close-line {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.8);
                    transform-origin: center;
                    transition: transform 0.3s ease, background 0.3s ease;
                }

                .close-line.first {
                    transform: translateY(-50%) rotate(45deg);
                }

                .close-line.second {
                    transform: translateY(-50%) rotate(-45deg);
                }

                /* Hover state – rotate + light up */
                .close-btn:hover {
                    border-color: rgba(255, 255, 255, 0.8);
                    transform: rotate(90deg);
                }

                .close-btn:hover .close-line {
                    background: #ffffff;
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
                }

                @media (max-width: 768px) {
                    .video-container {
                        width: calc(100vw - 60px) !important;
                        border-radius: 12px;
                    }

                    .close-btn {
                        top: 16px !important;
                        right: 16px !important;
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
                on: (event: string, callback: () => void) => void;
            };
        };
    }
}