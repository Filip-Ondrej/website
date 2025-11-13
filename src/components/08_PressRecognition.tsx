'use client';

import React from 'react';
import { LineAnchor } from '@/components/00_LineAnchor';

type VideoItem = {
    id: string;
    title: string;
    source: string;
    date: string;
    url: string;
    vimeoUrl?: string;
    year?: number;
};

const DEFAULT_VIMEO_URL = 'https://vimeo.com/1132746110';

const VIDEOS: VideoItem[] = [
    {
        id: 'a',
        title: 'Keynote: Autonomous Sites',
        source: 'TECHCONF',
        date: '2024-11',
        year: 2024,
        url: 'https://youtube.com/watch?v=AAAA',
        vimeoUrl: DEFAULT_VIMEO_URL,
    },
    {
        id: 'b',
        title: 'National TV Feature',
        source: 'NAT-TV',
        date: '2024-06',
        year: 2024,
        url: 'https://youtube.com/watch?v=BBBB',
        vimeoUrl: DEFAULT_VIMEO_URL,
    },
    {
        id: 'c',
        title: 'Interview w/ Press',
        source: 'DAILY JOURNAL',
        date: '2024-03',
        year: 2024,
        url: 'https://youtube.com/watch?v=CCCC',
        vimeoUrl: DEFAULT_VIMEO_URL,
    },
    {
        id: 'd',
        title: 'AI + Robotics Panel',
        source: 'FUTURE LAB',
        date: '2023-12',
        year: 2023,
        url: 'https://youtube.com/watch?v=DDDD',
        vimeoUrl: DEFAULT_VIMEO_URL,
    },
    {
        id: 'e',
        title: 'Award Speech',
        source: 'ROBOCUP INTL',
        date: '2023-07',
        year: 2023,
        url: 'https://youtube.com/watch?v=EEEE',
        vimeoUrl: DEFAULT_VIMEO_URL,
    },
];

const getVimeoId = (url?: string) => {
    if (!url) return '';
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : '';
};

export default function Recognition() {
    /* ---------------------------------
       responsive layout math
    --------------------------------- */
    const [vw, setVw] = React.useState(0);

    React.useLayoutEffect(() => {
        const onR = () => setVw(window.innerWidth);
        onR();
        window.addEventListener('resize', onR);
        return () => window.removeEventListener('resize', onR);
    }, []);

    // Responsive insets using fluid calculation
    const INSET = Math.max(20, Math.min(vw * 0.08, 100));

    const NAV_SIZE = vw <= 640 ? 28 : 32;
    const HEADER_PAD = vw <= 640 ? 8 : 12;

    // cage constants
    const TOP_Y = NAV_SIZE + HEADER_PAD * 2;
    const EXTRA_BOTTOM_SPACE = vw <= 640 ? 100 : 200;
    const MID_RATIO = 0.5;
    const CAP_OFFSET = TOP_Y;

    // aspect guess
    const ASPECT_W = 16;
    const ASPECT_H = 11;

    // x positions
    const xL = INSET;
    const xR = Math.max(INSET, vw - INSET);
    const xM = xL + (xR - xL) * MID_RATIO;

    // frame width
    const frameWidth = xM - xL;

    /* ---------------------------------
       card size + dynamic frame height
    --------------------------------- */
    const CARD_SCALE = vw <= 640 ? 0.96 : 0.92;
    const cardOuterW = frameWidth * CARD_SCALE;
    const sideGap = (frameWidth - cardOuterW) / 2;
    const cardOffsetX = sideGap;

    const guessedCardHeight = frameWidth * (ASPECT_H / ASPECT_W) + 64;
    const [measuredCardH, setMeasuredCardH] = React.useState<number | null>(null);
    const cardHeight = measuredCardH ?? guessedCardHeight;

    const frameHeight = cardHeight + sideGap * 2;
    const verticalPadding = sideGap;

    // y coords (bottom of cage is key for line anchors)
    const yTop = TOP_Y;
    const yBottom = yTop + frameHeight;
    const yCap = yTop - CAP_OFFSET; // 0

    const svgHeight = yBottom + EXTRA_BOTTOM_SPACE;

    /* ---------------------------------
       carousel state
    --------------------------------- */
    const total = VIDEOS.length;
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [prevSlide, setPrevSlide] = React.useState(0);

    const prev = () => {
        setPrevSlide(currentSlide);
        setCurrentSlide((i) => (i === 0 ? total - 1 : i - 1));
    };

    const next = () => {
        setPrevSlide(currentSlide);
        setCurrentSlide((i) => (i === total - 1 ? 0 : i + 1));
    };

    /* ---------------------------------
       header band geometry
    --------------------------------- */
    const headerX = xL;
    const headerY = yCap;
    const headerW = frameWidth;
    const headerH = yTop - yCap;
    const headerPadX = HEADER_PAD;
    const headerPadY = HEADER_PAD;

    /* ---------------------------------
       viewport / track geometry
    --------------------------------- */
    const viewportW = frameWidth * 2.2;
    const trackW = frameWidth * total;
    const trackTranslateX = currentSlide * frameWidth;

    // card measurement ref (for dynamic height)
    const mainCardRef = React.useRef<HTMLElement | null>(null);

    React.useLayoutEffect(() => {
        const el = mainCardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const h = rect.height;
        setMeasuredCardH((prev) =>
            prev === null || Math.abs(prev - h) > 2 ? h : prev,
        );
    }, [currentSlide, vw]);

    /* ---------------------------------
       video hover + fullscreen
    --------------------------------- */
    const [hoveredVideoId, setHoveredVideoId] = React.useState<string | null>(
        null,
    );
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [fullscreenVimeoId, setFullscreenVimeoId] =
        React.useState<string | null>(null);
    const fullscreenIframeRef = React.useRef<HTMLIFrameElement | null>(null);
    const backdropRef = React.useRef<HTMLDivElement | null>(null);

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
                window.scrollTo(0, scrollY);
                window.dispatchEvent(new Event('scroll'));
                window.dispatchEvent(new Event('resize'));

                // Double-check after another frame
                requestAnimationFrame(() => {
                    window.scrollTo(0, scrollY);
                    window.dispatchEvent(new Event('scroll'));
                    window.dispatchEvent(new Event('resize'));
                });
            });
        };
    }, [isFullscreen, fullscreenVimeoId]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) {
            setIsFullscreen(false);
        }
    };

    return (
        <>
            <section className="recog-wrap">
                {/* LINE ANCHORS OVERLAY */}
                <div className="pointer-events-none absolute inset-0 z-[25]">
                    {/* small top-left anchor */}
                    <div className="absolute left-0 top-[12px]">
                        <LineAnchor
                            id="recognition-start-left-top"
                            position="left"
                            offsetX={100}
                        />
                    </div>

                    {/* anchors exactly on bottom card line */}
                    <div
                        className="absolute left-0 w-0"
                        style={{ top: yBottom }}
                    >
                        <LineAnchor
                            id="recognition-bottom-left"
                            position="left"
                            offsetX={100}
                        />
                    </div>
                    <div
                        className="absolute right-0 w-0"
                        style={{ top: yBottom }}
                    >
                        <LineAnchor
                            id="recognition-bottom-right"
                            position="right"
                            offsetX={100}
                        />
                    </div>

                    {/* extra point 100px below bottom line on the right */}
                    <div
                        className="absolute right-0 w-0"
                        style={{ top: yBottom + 100 }}
                    >
                        <LineAnchor
                            id="recognition-under-right"
                            position="right"
                            offsetX={100}
                        />
                    </div>
                </div>

                {/* ===================== STATIC GRID LINES ===================== */}
                <svg
                    className="gridSvg"
                    width={vw}
                    height={svgHeight}
                    style={{ height: svgHeight }}
                >
                    <line
                        x1={xM}
                        y1={yTop}
                        x2={xM}
                        y2={yBottom}
                        className="gridLine"
                    />
                    <line
                        x1={xR}
                        y1={yTop}
                        x2={xR}
                        y2={svgHeight}
                        className="gridLine"
                    />
                    <line
                        x1={xL}
                        y1={yTop}
                        x2={vw}
                        y2={yTop}
                        className="gridLine"
                    />
                    <line
                        x1={xL}
                        y1={yBottom}
                        x2={vw}
                        y2={yBottom}
                        className="gridLine"
                    />
                    <line
                        x1={xL}
                        y1={yCap}
                        x2={xM}
                        y2={yCap}
                        className="gridLine"
                    />
                    <line
                        x1={xM}
                        y1={yCap}
                        x2={xM}
                        y2={yTop}
                        className="gridLine"
                    />
                </svg>

                {/* ===================== HEADER BAND ===================== */}
                <div
                    className="headerBand"
                    style={{
                        left: headerX,
                        top: headerY,
                        width: headerW,
                        height: headerH,
                    }}
                >
                    <div
                        className="bandInner"
                        style={{
                            padding: `${headerPadY}px ${headerPadX}px`,
                        }}
                    >
                        <div className="counterBlock">
                            <span className="counterText">
                                [{String(currentSlide + 1).padStart(2, '0')}/
                                {String(total).padStart(2, '0')}]
                            </span>
                        </div>

                        <div className="navBlock">
                            <button
                                className="navBtn"
                                onClick={prev}
                                aria-label="Previous"
                            >
                                <span className="navBtnInner">
                                    <svg
                                        width={NAV_SIZE - 12}
                                        height={NAV_SIZE - 12}
                                        viewBox="0 0 24 24"
                                        className="chevronIcon"
                                    >
                                        <path
                                            d="M14 7L9 12L14 17"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="square"
                                            strokeLinejoin="miter"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </svg>
                                </span>
                            </button>

                            <button
                                className="navBtn"
                                onClick={next}
                                aria-label="Next"
                            >
                                <span className="navBtnInner">
                                    <svg
                                        width={NAV_SIZE - 12}
                                        height={NAV_SIZE - 12}
                                        viewBox="0 0 24 24"
                                        className="chevronIcon"
                                    >
                                        <path
                                            d="M10 7L15 12L10 17"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="square"
                                            strokeLinejoin="miter"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===================== CAROUSEL VIEWPORT ===================== */}
                <div
                    className="carouselViewport"
                    style={{
                        left: xL,
                        top: yTop,
                        width: viewportW,
                        height: frameHeight,
                    }}
                >
                    <div
                        className="carouselTrack"
                        style={{
                            width: trackW,
                            height: '100%',
                            transform: `translateX(-${trackTranslateX}px)`,
                        }}
                    >
                        {VIDEOS.map((vid, rawIndex) => {
                            const frameLeft = rawIndex * frameWidth;
                            const indexLabel = String(rawIndex + 1).padStart(2, '0');
                            const isMain = rawIndex === currentSlide;

                            const vimeoId =
                                getVimeoId(vid.vimeoUrl) ||
                                getVimeoId(DEFAULT_VIMEO_URL);

                            // only current + next are fully visible → clickable
                            const isClickable =
                                rawIndex === currentSlide ||
                                rawIndex === (currentSlide + 1) % total;

                            const handleClick = () => {
                                if (!isClickable || !vimeoId) return;
                                setFullscreenVimeoId(vimeoId);
                                setIsFullscreen(true);
                            };

                            return (
                                <article
                                    key={vid.id + '-' + rawIndex}
                                    ref={
                                        isMain
                                            ? (mainCardRef as React.RefObject<HTMLElement>)
                                            : undefined
                                    }
                                    className={`videoCard ${
                                        isClickable ? 'clickable' : 'teaser'
                                    }`}
                                    style={{
                                        left: frameLeft + cardOffsetX,
                                        top: verticalPadding,
                                        width: cardOuterW,
                                    }}
                                    onMouseEnter={() => {
                                        if (isClickable) setHoveredVideoId(vid.id);
                                    }}
                                    onMouseLeave={() => {
                                        if (hoveredVideoId === vid.id) {
                                            setHoveredVideoId(null);
                                        }
                                    }}
                                    onClick={handleClick}
                                    role={isClickable ? 'button' : undefined}
                                    tabIndex={isClickable ? 0 : -1}
                                    onKeyDown={(e) => {
                                        if (!isClickable) return;
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleClick();
                                        }
                                    }}
                                >
                                    {/* caption bar */}
                                    <div className="cardCaption">
                                        <span className="capIndex">
                                            [{indexLabel}]
                                        </span>
                                        {typeof vid.year === 'number' && (
                                            <>
                                                <span className="capDot" />
                                                <span className="capYear">
                                                    {vid.year}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* title row */}
                                    <div className="cardTitleRow">
                                        <h3 className="cardTitle">{vid.title}</h3>
                                    </div>

                                    {/* VIDEO VISUAL – looping Vimeo */}
                                    <div className="videoVisual">
                                        {vimeoId && (
                                            <iframe
                                                title={`${vid.title} background`}
                                                src={`https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&autopause=0&muted=1`}
                                                allow="autoplay; fullscreen; picture-in-picture"
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 'none',
                                                    display: 'block',
                                                    pointerEvents: 'none',
                                                    background: '#000',
                                                }}
                                            />
                                        )}

                                        {/* Play overlay with new design */}
                                        <div
                                            className={
                                                isClickable &&
                                                hoveredVideoId === vid.id
                                                    ? 'playOverlay visible'
                                                    : 'playOverlay'
                                            }
                                        >
                                            <svg
                                                className="playIcon"
                                                viewBox="0 0 100 100"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <defs>
                                                    <filter id={`softGlow-${vid.id}`}>
                                                        <feGaussianBlur
                                                            stdDeviation="2"
                                                            result="coloredBlur"
                                                        />
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
                                                    filter={`url(#softGlow-${vid.id})`}
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* footer – source tag only */}
                                    <div className="cardFooter">
                                        <span className="videoSourceTag">
                                            {vid.source}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                {/* spacer */}
                <div style={{ height: svgHeight }} />

                <style jsx>{`
                    @keyframes fadeInRecognition {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
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

                    .recog-wrap {
                        position: relative;
                        background: transparent;
                        color: #fff;
                        padding-bottom: clamp(40px, 8vw, 80px);
                        overflow-x: hidden;
                        font-family: 'Rajdhani', monospace;
                        margin: 0;
                    }

                    .gridSvg {
                        position: absolute;
                        left: 0;
                        top: 0;
                        pointer-events: none;
                        display: block;
                        overflow: visible;
                        z-index: 0;
                    }
                    .gridLine {
                        stroke: rgba(255, 255, 255, 0.12);
                        stroke-width: 1;
                        shape-rendering: crispEdges;
                    }

                    .headerBand {
                        position: absolute;
                        z-index: 10;
                        pointer-events: none;
                        display: flex;
                    }
                    .bandInner {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: clamp(8px, 2vw, 16px);
                        pointer-events: auto;
                    }

                    .counterBlock {
                        display: flex;
                        align-items: center;
                        margin-left: 6px;
                    }
                    .counterText {
                        font-family: 'Rajdhani', monospace;
                        font-weight: 600;
                        font-size: clamp(12px, 2vw, 20px);
                        line-height: 1;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: rgba(255, 255, 255, 0.85);
                        text-shadow: 0 0 8px rgba(255, 255, 255, 0.22);
                    }

                    .navBlock {
                        display: flex;
                        align-items: center;
                        gap: clamp(4px, 1vw, 8px);
                    }
                    .navBtn {
                        appearance: none;
                        background: rgba(0, 0, 0, 0.45);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        color: rgba(255, 255, 255, 0.7);
                        width: ${NAV_SIZE}px;
                        height: ${NAV_SIZE}px;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        position: relative;
                        box-shadow: 0 clamp(8px, 2vw, 16px) clamp(16px, 4vw, 32px) rgba(0, 0, 0, 0.75);
                        transition:
                            border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                            box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                            transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                            color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .navBtnInner {
                        width: 100%;
                        height: 100%;
                        display: grid;
                        place-items: center;
                        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    @media (hover: hover) {
                        .navBtn:hover {
                            border-color: rgba(255, 255, 255, 0.8);
                            color: rgba(255, 255, 255, 1);
                            box-shadow:
                                0 0 12px rgba(255, 255, 255, 0.4),
                                0 clamp(15px, 4vw, 30px) clamp(30px, 8vw, 60px) rgba(0, 0, 0, 0.9);
                            transform: translateY(-2px) scale(1.03);
                        }
                        .navBtn:hover .navBtnInner {
                            transform: scale(1.07);
                        }
                    }

                    .navBtn:active {
                        transform: scale(0.94);
                        transition-duration: 0.1s;
                    }

                    .carouselViewport {
                        position: absolute;
                        z-index: 20;
                        overflow: hidden;
                        pointer-events: none;
                    }

                    .carouselTrack {
                        position: absolute;
                        left: 0;
                        top: 0;
                        display: block;
                        transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
                        will-change: transform;
                        pointer-events: auto;
                    }

                    .videoCard {
                        position: absolute;
                        display: flex;
                        flex-direction: column;
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        background: #131315;
                        box-shadow: none;
                        overflow: hidden;
                        transform-origin: center;
                        transform: translateZ(0) scale(1);
                        will-change: transform, box-shadow;
                        z-index: 30;
                        transition:
                                transform 140ms cubic-bezier(0.22, 1, 0.36, 1),
                                box-shadow 140ms ease,
                                border-color 120ms ease,
                                background 120ms ease;
                        cursor: default;
                    }

                    .videoCard.clickable {
                        cursor: pointer;
                    }

                    @media (hover: hover) {
                        .videoCard.clickable:hover {
                            transform: scale(1.03);
                            box-shadow:
                                    /*0 32px 88px rgba(0, 0, 0, 0.7),*/
                                    0 0 0 1px rgba(255, 255, 255, 0.08),
                                    0 0 36px rgba(255, 255, 255, 0.12);  // Glow directly on card
                            border-color: rgba(255, 255, 255, 0.28);
                            background: #171719;
                            z-index: 50;
                        }
                    }

                    /*.cardCaption,
                    .cardTitleRow,
                    .cardFooter {
                        background: #131315;
                    }*/

                    .cardCaption {
                        position: relative;
                        display: flex;
                        align-items: center;
                        gap: clamp(6px, 1.5vw, 10px);
                        padding: clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 14px);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    }

                    .capIndex,
                    .capYear {
                        font: 600 clamp(9px, 1.5vw, 11px)/1 'Rajdhani', monospace;
                        letter-spacing: 0.16em;
                        color: rgba(255, 255, 255, 0.56);
                        text-transform: uppercase;
                    }
                    .capDot {
                        width: clamp(2px, 0.5vw, 3px);
                        height: clamp(2px, 0.5vw, 3px);
                        border-radius: 999px;
                        background: rgba(255, 255, 255, 0.25);
                    }

                    .cardTitleRow {
                        padding: clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 14px) clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 14px);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    }

                    .cardTitle {
                        font-family: 'Rajdhani', monospace;
                        font-weight: 800;
                        font-size: clamp(15px, 2.8vw, 22px);
                        line-height: 1.15;
                        color: #fff;
                        margin: 0;
                        letter-spacing: 0.01em;
                    }

                    .videoVisual {
                        position: relative;
                        width: 100%;
                        padding-bottom: 56.25%; /* 16:9 aspect ratio */
                        background: #000;
                        border-top: 1px solid rgba(255, 255, 255, 0.08);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                        overflow: hidden;
                    }

                    .playOverlay {
                        position: absolute;
                        inset: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(0, 0, 0, 0.4);
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.3s ease;
                    }
                    .playOverlay.visible {
                        opacity: 1;
                    }

                    /* teaser cards never show play overlay */
                    .videoCard.teaser .playOverlay {
                        opacity: 0 !important;
                    }

                    .playIcon {
                        width: clamp(80px, 15vw, 140px);
                        height: clamp(80px, 15vw, 140px);
                        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
                        transform: scale(0.8);
                        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    .playOverlay.visible .playIcon {
                        transform: scale(1);
                    }

                    .cardFooter {
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        padding: clamp(10px, 2vw, 12px) clamp(10px, 2.5vw, 14px) clamp(12px, 2.5vw, 14px);
                        border-top: 1px solid rgba(255, 255, 255, 0.08);
                        gap: clamp(8px, 2vw, 16px);
                        flex-wrap: wrap;
                    }

                    .videoSourceTag {
                        padding: clamp(4px, 1vw, 5px) clamp(8px, 1.5vw, 10px);
                        font-size: clamp(9px, 1.5vw, 11px);
                        font-weight: 600;
                        line-height: 1;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        color: rgba(255, 255, 255, 0.5);
                        background: transparent;
                        white-space: nowrap;
                        transition: all 0.3s ease;
                    }

                    @media (hover: hover) {
                        .videoSourceTag:hover {
                            color: rgba(255, 255, 255, 0.8);
                            border-color: rgba(255, 255, 255, 0.3);
                        }
                    }
                `}</style>
            </section>

            {/* ===================== FULLSCREEN MODAL ===================== */}
            {isFullscreen && fullscreenVimeoId && (
                <div
                    ref={backdropRef}
                    className="fullscreenModal"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.98)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeInRecognition 0.3s ease-out',
                        backdropFilter: 'blur(10px)',
                    }}
                    onClick={handleBackdropClick}
                    onWheel={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                >
                    <div className="lightbox-container">
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
                                src={`https://player.vimeo.com/video/${fullscreenVimeoId}?autoplay=1`}
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    background: '#000',
                                }}
                            />
                        </div>

                        <button
                            className="recogCloseBtn"
                            onClick={() => setIsFullscreen(false)}
                            aria-label="Close"
                        >
                            <span className="recogCloseLine" />
                            <span className="recogCloseLine" />
                        </button>
                    </div>

                    <style jsx>{`
                        .lightbox-container {
                            position: relative;
                            max-width: 90vw;
                            max-height: 90vh;
                            animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                        }

                        .recogCloseBtn {
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

                        .recogCloseLine {
                            position: absolute;
                            width: 20px;
                            height: 2px;
                            background: rgba(255, 255, 255, 0.9);
                            transition: background 0.3s ease;
                        }

                        .recogCloseLine:first-child {
                            transform: rotate(45deg);
                        }

                        .recogCloseLine:last-child {
                            transform: rotate(-45deg);
                        }

                        @media (hover: hover) {
                            .recogCloseBtn:hover {
                                background: rgba(0, 0, 0, 0.9);
                                border-color: rgba(255, 255, 255, 0.5);
                                transform: rotate(90deg);
                            }

                            .recogCloseBtn:hover .recogCloseLine {
                                background: #ffffff;
                            }
                        }

                        @media (max-width: 1024px) {
                            .recogCloseBtn {
                                top: 20px;
                                right: 20px;
                            }
                        }

                        @media (max-width: 768px) {
                            .recogCloseBtn {
                                top: 10px !important;
                                right: 10px !important;
                                width: 40px !important;
                                height: 40px !important;
                            }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}

/* Vimeo typings */
declare global {
    interface Window {
        Vimeo?: {
            Player: new (iframe: HTMLIFrameElement) => {
                on: (event: string, callback: (data: { fullscreen: boolean }) => void) => void;
            };
        };
    }
}