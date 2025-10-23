'use client';

import React from 'react';

type Props = {
    videoId?: string;
    promoVideoId?: string;
    className?: string;
};

export default function PromoVideo({
                                       videoId = '6SewsiajtvQ',
                                       promoVideoId = '_T8Ft80lDcY',
                                       className,
                                   }: Props) {
    const sectionRef = React.useRef<HTMLElement>(null);
    const scrollRafRef = React.useRef<number | null>(null);
    const resizeRafRef = React.useRef<number | null>(null);

    const [scrollProgress, setScrollProgress] = React.useState(0);
    const [containerW, setContainerW] = React.useState<number>(0);
    const [vh, setVh] = React.useState<number>(
        typeof window !== 'undefined' ? window.innerHeight : 800
    );
    const [videoBottom, setVideoBottom] = React.useState<number>(0);
    const [isHoveringVideo, setIsHoveringVideo] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // helpers
    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const mapRange = (x: number, a: number, b: number) => clamp01((x - a) / (b - a));
    const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const easeSineInOut = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

    const calculateVideoBottom = React.useCallback((width: number) => {
        const videoWidth = width * 0.5 - 100;
        const videoHeight = videoWidth * (9 / 16);
        const videoTop = 100;
        return videoTop + videoHeight - 20;
    }, []);

    React.useEffect(() => {
        if (sectionRef.current) {
            const initialWidth = sectionRef.current.clientWidth;
            setContainerW(initialWidth);
            setVh(window.innerHeight);
            setVideoBottom(calculateVideoBottom(initialWidth));
        }

        const handleScroll = () => {
            if (scrollRafRef.current) return;
            scrollRafRef.current = requestAnimationFrame(() => {
                if (!sectionRef.current) {
                    scrollRafRef.current = null;
                    return;
                }
                const rect = sectionRef.current.getBoundingClientRect();
                const sectionHeight = rect.height;
                const viewportHeight = window.innerHeight;
                const scrolled = (viewportHeight - rect.top) / (sectionHeight + viewportHeight);
                setScrollProgress(clamp01(scrolled));
                scrollRafRef.current = null;
            });
        };

        const handleResize = () => {
            if (resizeRafRef.current) return;
            resizeRafRef.current = requestAnimationFrame(() => {
                if (!sectionRef.current) {
                    resizeRafRef.current = null;
                    return;
                }
                const newWidth = sectionRef.current.clientWidth;
                setContainerW(newWidth);
                setVh(window.innerHeight);
                setVideoBottom(calculateVideoBottom(newWidth));
                resizeRafRef.current = null;
            });
        };

        window.addEventListener('scroll', handleScroll, {passive: true});
        window.addEventListener('resize', handleResize);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
            if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
        };
    }, [calculateVideoBottom]);

    // Motion phases
    const p1 = mapRange(scrollProgress, 0.0, 0.3);
    const p2 = easeInOut(mapRange(scrollProgress, 0.3, 0.55));
    const p3 = easeSineInOut(mapRange(scrollProgress, 0.6, 0.85));

    const translateY = p1 * 20;
    const videoPercent = 50 + p2 * 50;
    const videoWidthCalc = `calc(${videoPercent}% - 100px)`;

    const elemWpx = Math.max(0, containerW * (videoPercent / 100) - 100);
    const centerLeft = Math.max(0, (containerW - elemWpx) / 2);
    const translateX = centerLeft * p2;

    const punchScale = 1 + p2 * 0.05;
    const TOP_BOTTOM_PAD = 100;
    const availableH = Math.max(0, vh - TOP_BOTTOM_PAD);
    const naturalH = elemWpx * (9 / 16);
    const fitScale = naturalH > 0 ? Math.min(1, availableH / naturalH) : 1;
    const innerScale = Math.min(punchScale, fitScale);

    const rotateX = -30 * p3;
    const mirrorOpacity = 0.3 * p3;

    const titleHeight = Math.max(0, videoBottom);

    const dissolveProgress = mapRange(p2, 0.0, 0.65);

    // Handle video click - open modal
    const handleVideoClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Disable body scroll when modal is open
    React.useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    // Close modal on ESC key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isModalOpen]);

    return (
        <>
            <section ref={sectionRef} className={`promo-section ${className ?? ''}`}>
                <div className="guide-line-left-top" style={{height: `${videoBottom}px`}} aria-hidden="true"/>
                <div className="guide-line-left-bottom" style={{top: `${videoBottom}px`}} aria-hidden="true"/>
                <div className="guide-line-right" style={{height: `${videoBottom}px`}} aria-hidden="true"/>
                <div className="guide-line-horizontal" style={{top: `${videoBottom}px`}} aria-hidden="true"/>

                <aside
                    className="title-rail"
                    aria-label="section title"
                    style={{height: `${titleHeight}px`}}
                >
                    <h1 className="title">
                        <HexEncryptLine text="Think You Know What" progress={dissolveProgress} isSmall/>
                        <HexEncryptLine text="'Dedicated'" progress={dissolveProgress} isGold isXLarge/>
                        <HexEncryptLine text="Looks Like? Watch This." progress={dissolveProgress} isSmall
                                        hasInlineGold/>
                    </h1>
                </aside>

                <div
                    className="video-wrapper"
                    style={{
                        width: videoWidthCalc,
                        transform: `translateX(${translateX}px) translateY(${translateY}px) perspective(1200px) rotateX(${rotateX}deg)`,
                    }}
                >
                    <div className="video-container" style={{transform: `scale(${innerScale})`}}>
                        <div
                            className="video-frame"
                            onMouseEnter={() => setIsHoveringVideo(true)}
                            onMouseLeave={() => setIsHoveringVideo(false)}
                        >
                            <iframe
                                className="video"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0`}
                                allow="autoplay; encrypted-media"
                                title="Background video"
                            />

                            {/* Clickable overlay on top of iframe */}
                            <div
                                className="video-click-overlay"
                                onClick={handleVideoClick}
                            />

                            <div className={`play-button-overlay ${isHoveringVideo ? 'visible' : ''}`}>
                                <svg className="play-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
                        <div/>
                        {/* Mirror reflection */}
                        <div className="mirror" style={{opacity: mirrorOpacity}}>
                            {mirrorOpacity > 0.01 && (
                                <iframe
                                    className="video"
                                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0`}
                                    allow="autoplay; encrypted-media"
                                    title="Mirror reflection"
                                />
                            )}
                        </div>
                    </div>


                </div>

                <style jsx>{`
                    .promo-section {
                        position: relative;
                        min-height: 150vh;
                        padding: 45px 100px;
                        display: block;
                        perspective: 2000px;
                        box-sizing: border-box;
                    }

                    .title-rail {
                        position: fixed;
                        top: 0;
                        left: calc(50vw - 50px);
                        right: 100px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 5;
                        pointer-events: none;
                    }

                    .title {
                        margin: 0;
                        font-family: "Rajdhani", monospace;
                        text-transform: uppercase;
                        letter-spacing: 0.06em;
                        line-height: 1.0;
                        text-align: center;
                    }

                    .guide-line-left-top,
                    .guide-line-left-bottom,
                    .guide-line-right,
                    .guide-line-horizontal {
                        position: absolute;
                        background: rgba(255, 255, 255, 0.14);
                        pointer-events: none;
                        z-index: 1;
                    }

                    .guide-line-left-top {
                        display: none;
                        width: 1px;
                        left: 100px;
                    }

                    .guide-line-left-bottom {
                        width: 1px;
                        left: 100px;
                        bottom: 0;
                    }

                    .guide-line-right {
                        width: 1px;
                        top: 0;
                        right: 100px;
                        height: 100%;
                    }

                    .guide-line-horizontal {
                        height: 1px;
                        left: 100px;
                        right: 100px;
                    }

                    .video-wrapper {
                        position: sticky;
                        top: 100px;
                        margin-bottom: 50px;
                        transition: transform 800ms cubic-bezier(0.23, 1, 0.32, 1);
                        transform-style: preserve-3d;
                        transform-origin: center center;
                        box-sizing: border-box;
                        z-index: 10;
                        will-change: transform;
                    }

                    .video-container {
                        position: relative;
                        width: 100%;
                        aspect-ratio: 16 / 9;
                        transition: transform 800ms cubic-bezier(0.23, 1, 0.32, 1);
                        transform-origin: center center;
                        will-change: transform;
                    }

                    .video-frame {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 40px 100px rgba(0, 0, 0, 0.5);
                        cursor: pointer;
                    }

                    .video-click-overlay {
                        position: absolute;
                        inset: 0;
                        z-index: 1;
                        cursor: pointer;
                    }

                    .play-button-overlay {
                        position: absolute;
                        inset: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        transition: opacity 0.25s ease;
                        pointer-events: none;
                        z-index: 2;
                    }

                    .play-button-overlay.visible {
                        opacity: 1;
                    }

                    .play-icon {
                        width: 200px;
                        height: 200px;
                    }

                    .video {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        border: none;
                        display: block;
                    }

                    /* Mirror reflection - pure CSS, no iframe */
                    .mirror {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        width: 100%;
                        aspect-ratio: 16 / 9;
                        border-radius: 16px;
                        overflow: hidden;
                        pointer-events: none;
                        background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 70%);
                        transform: scaleY(-1);
                        filter: blur(3px);
                        mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0) 70%);
                        will-change: opacity;
                    }

                    @media (max-width: 900px) {
                        .title-rail {
                            display: none;
                        }
                    }

                    @media (max-width: 768px) {
                        .promo-section {
                            padding: 80px 24px;
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        * {
                            transition: none !important;
                            animation: none !important;
                        }

                        .video-wrapper, .video-container {
                            will-change: auto;
                        }
                    }
                `}</style>
            </section>

            {/* Video Modal */}
            {isModalOpen && (
                <div className="video-modal-overlay" onClick={handleCloseModal}>
                    <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseModal} aria-label="Close modal">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <rect width="32" height="32" rx="4" fill="rgba(255, 255, 255, 0.05)"/>
                                <rect width="32" height="32" rx="4" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1"/>
                                <path d="M20 12L12 20M12 12L20 20" stroke="white" strokeWidth="2"
                                      strokeLinecap="round"/>
                            </svg>
                        </button>
                        <div className="modal-video-wrapper">
                            <iframe
                                className="modal-video"
                                src={`https://www.youtube.com/embed/${promoVideoId}?autoplay=1&rel=0`}
                                allow="autoplay; encrypted-media; fullscreen"
                                allowFullScreen
                                title="Promo video"
                            />
                        </div>
                    </div>

                    <style jsx>{`
                        .video-modal-overlay {
                            position: fixed;
                            inset: 0;
                            background: rgba(0, 0, 0, 0.95);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 9999;
                            padding: 40px;
                            animation: fadeIn 0.3s ease;
                        }

                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                            }
                            to {
                                opacity: 1;
                            }
                        }

                        .video-modal-content {
                            position: relative;
                            width: 100%;
                            max-width: 1400px;
                            animation: scaleIn 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                        }

                        @keyframes scaleIn {
                            from {
                                transform: scale(0.95);
                                opacity: 0;
                            }
                            to {
                                transform: scale(1);
                                opacity: 1;
                            }
                        }

                        .modal-close {
                            position: absolute;
                            top: -50px;
                            right: 0;
                            background: transparent;
                            border: none;
                            cursor: pointer;
                            padding: 0;
                            transition: opacity 0.2s;
                            z-index: 10;
                        }

                        .modal-close:hover {
                            opacity: 0.7;
                        }

                        .modal-video-wrapper {
                            position: relative;
                            width: 100%;
                            aspect-ratio: 16 / 9;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 50px 150px rgba(0, 0, 0, 0.8);
                        }

                        .modal-video {
                            position: absolute;
                            inset: 0;
                            width: 100%;
                            height: 100%;
                            border: none;
                        }

                        @media (max-width: 768px) {
                            .video-modal-overlay {
                                padding: 20px;
                            }

                            .modal-close {
                                top: -40px;
                            }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}

// (HexEncryptLine component unchanged)

type LineProps = {
    text: string;
    progress: number;
    isSmall?: boolean;
    isXLarge?: boolean;
    isGold?: boolean;
    hasInlineGold?: boolean;
};

function HexEncryptLine({text, progress, isSmall, isXLarge, isGold, hasInlineGold}: LineProps) {
    const [currentHex, setCurrentHex] = React.useState<string>('0');
    const lineRef = React.useRef<HTMLSpanElement>(null);
    const [fixedWidth, setFixedWidth] = React.useState<number | null>(null);

    const chars = React.useMemo(() => {
        if (hasInlineGold) {
            const parts = text.split('Watch This.');
            return {
                main: parts[0].split(''),
                gold: 'Watch This.'.split(''),
            };
        }
        return {main: text.split(''), gold: []};
    }, [text, hasInlineGold]);

    const totalChars = chars.main.length + chars.gold.length;

    React.useEffect(() => {
        if (lineRef.current && fixedWidth === null && progress === 0) {
            setFixedWidth(lineRef.current.offsetWidth);
        }
    }, [progress, fixedWidth]);

    const hexChars = '0123456789ABCDEF';

    const rawIndex = progress * totalChars;
    const currentIndex = Math.floor(rawIndex);
    const charProgress = rawIndex - currentIndex;
    const flickerIndex = Math.floor(charProgress * 8);

    React.useEffect(() => {
        if (progress > 0) {
            setCurrentHex(hexChars[Math.floor(Math.random() * hexChars.length)]);
        }
    }, [currentIndex, flickerIndex, progress]);

    const renderChar = (char: string, index: number, isGoldText: boolean) => {
        const isApostrophe = char === "'" || char === '\u2018' || char === '\u2019';

        if (progress <= 0) {
            return (
                <span key={index} className={`char ${isGoldText ? 'gold-text' : ''}`}>
                    {char}
                </span>
            );
        }

        if (index < currentIndex) {
            return (
                <span key={index} className={`char ${isGoldText ? 'gold-text' : ''}`}
                      style={{opacity: 0, visibility: 'hidden'}}>
                    {char}
                </span>
            );
        }

        if (index === currentIndex && flickerIndex < 8) {
            if (isApostrophe) {
                const fadeOpacity = 1 - (flickerIndex / 8);
                return (
                    <span key={index} className={`char ${isGoldText ? 'gold-text' : ''}`}
                          style={{opacity: fadeOpacity}}>
                        {char}
                    </span>
                );
            }

            const hexColor = 'rgba(255, 255, 255, 0.9)';
            const hexShadow = '0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2)';

            return (
                <span key={index} className="char encrypting" style={{
                    opacity: 0.7,
                    color: hexColor,
                    textShadow: hexShadow,
                    fontFamily: 'monospace',
                    fontWeight: 700
                }}>
                    {currentHex}
                </span>
            );
        }

        if (index === currentIndex && flickerIndex >= 8) {
            return (
                <span key={index} className={`char ${isGoldText ? 'gold-text' : ''}`}
                      style={{opacity: 0, visibility: 'hidden'}}>
                    {char}
                </span>
            );
        }

        return (
            <span key={index} className={`char ${isGoldText ? 'gold-text' : ''}`}>
                {char}
            </span>
        );
    };

    const sizeClass = isSmall ? 'small' : isXLarge ? 'xlarge' : '';
    const colorClass = isGold ? 'gold-text' : '';

    return (
        <>
            <span
                ref={lineRef}
                className={`line ${sizeClass} ${colorClass}`}
                style={fixedWidth ? {
                    width: `${fixedWidth + 50}px`,
                    display: 'inline-block',
                    whiteSpace: 'nowrap'
                } : undefined}
            >
                {chars.main.map((char, i) => renderChar(char, i, isGold || false))}
                {hasInlineGold && chars.gold.map((char, i) => renderChar(char, chars.main.length + i, true))}
            </span>

            <style jsx>{`
                .line {
                    display: block;
                    margin: 0.02em 0;
                }

                .char {
                    display: inline-block;
                }

                .small {
                    color: rgba(255, 255, 255, 0.92);
                    font-weight: 800;
                    font-size: clamp(28px, 3.8vw, 68px);
                }

                .xlarge {
                    font-weight: 900;
                    font-size: clamp(52px, 7.5vw, 140px);
                }

                .gold-text {
                    background: linear-gradient(135deg, #FEF3C7 0%, #FDE047 25%, #FFD60A 50%, #F59E0B 75%, #B45309 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    filter: drop-shadow(0 0 8px rgba(255, 214, 10, 0.4));
                }
            `}</style>
        </>
    );
}