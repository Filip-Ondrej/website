'use client';

import React from 'react';

type VideoItem = {
    id: string;
    title: string;
    source: string;
    date: string;
    url: string;        // keep your YouTube (if you need it elsewhere)
    vimeoUrl?: string;  // NEW: vimeo link for this card
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

const getVimeoId = (url: string | undefined) => {
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

    const INSET = vw <= 640 ? 40 : vw <= 1024 ? 60 : 100;

    const NAV_SIZE = 32;
    const HEADER_PAD = 12;

    // cage constants
    const TOP_Y = NAV_SIZE + HEADER_PAD * 2;
    const EXTRA_BOTTOM_SPACE = 200;
    const MID_RATIO = 0.5;
    const CAP_OFFSET = TOP_Y;

    // approximate aspect
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
    const CARD_SCALE = 0.92;
    const cardOuterW = frameWidth * CARD_SCALE;
    const sideGap = (frameWidth - cardOuterW) / 2;
    const cardOffsetX = sideGap;

    const guessedCardHeight = frameWidth * (ASPECT_H / ASPECT_W) + 64;
    const [measuredCardH, setMeasuredCardH] = React.useState<number | null>(null);
    const cardHeight = measuredCardH ?? guessedCardHeight;

    const frameHeight = cardHeight + sideGap * 2;
    const verticalPadding = sideGap;

    // y coords
    const yTop = TOP_Y;
    const yBottom = yTop + frameHeight;
    const yCap = yTop - CAP_OFFSET; // = 0

    const svgHeight = yBottom + EXTRA_BOTTOM_SPACE;

    /* ---------------------------------
       carousel state
    --------------------------------- */
    const total = VIDEOS.length;
    const [currentSlide, setCurrentSlide] = React.useState(0);

    const prev = () => {
        setCurrentSlide((i) => (i === 0 ? total - 1 : i - 1));
    };

    const next = () => {
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

    // card measurement ref
    const mainCardRef = React.useRef<HTMLElement | null>(null);

    React.useLayoutEffect(() => {
        const el = mainCardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const h = rect.height;
        setMeasuredCardH((prev) =>
            prev === null || Math.abs(prev - h) > 2 ? h : prev
        );
    }, [currentSlide, vw]);

    /* ---------------------------------
       video hover + fullscreen state
    --------------------------------- */
    const [hoveredVideoId, setHoveredVideoId] = React.useState<string | null>(
        null,
    );
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [fullscreenVimeoId, setFullscreenVimeoId] = React.useState<string | null>(
        null,
    );
    const fullscreenIframeRef = React.useRef<HTMLIFrameElement | null>(null);

    // fullscreen body lock + Vimeo "ended" listener
    React.useEffect(() => {
        const setupVimeoListener = () => {
            if (fullscreenIframeRef.current && window.Vimeo) {
                const player = new window.Vimeo.Player(fullscreenIframeRef.current);
                player.on('ended', () => {
                    setIsFullscreen(false);
                });
            }
        };

        if (isFullscreen && fullscreenVimeoId) {
            // lock scroll
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';

            // load Vimeo API if needed
            if (!window.Vimeo) {
                const script = document.createElement('script');
                script.src = 'https://player.vimeo.com/api/player.js';
                script.onload = () => setupVimeoListener();
                document.body.appendChild(script);
            } else {
                setupVimeoListener();
            }
        } else {
            // restore scroll position
            const top = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
            if (top) {
                const scrollY = parseInt(top || '0', 10) * -1;
                if (!Number.isNaN(scrollY)) window.scrollTo(0, scrollY);
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
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
        };
    }, [isFullscreen, fullscreenVimeoId]);

    return (
        <>
            <section className="recog-wrap">
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
                            const isClickable =
                                rawIndex === currentSlide ||
                                rawIndex === (currentSlide + 1) % total;
                            const indexLabel = String(rawIndex + 1).padStart(2, '0');
                            const isMain = rawIndex === currentSlide;

                            const vimeoId =
                                getVimeoId(vid.vimeoUrl) ||
                                getVimeoId(DEFAULT_VIMEO_URL);

                            return (
                                <article
                                    key={vid.id + '-' + rawIndex}
                                    ref={isMain ? (mainCardRef as React.RefObject<HTMLElement>) : undefined}
                                    className={`videoCard ${
                                        isClickable ? 'clickable' : 'teaser'
                                    }`}
                                    style={{
                                        left: frameLeft + cardOffsetX,
                                        top: verticalPadding,
                                        width: cardOuterW,
                                    }}
                                    onMouseEnter={() => setHoveredVideoId(vid.id)}
                                    onMouseLeave={() =>
                                        setHoveredVideoId((prev) =>
                                            prev === vid.id ? null : prev,
                                        )
                                    }
                                    onClick={() => {
                                        if (!vimeoId) return;
                                        setFullscreenVimeoId(vimeoId);
                                        setIsFullscreen(true);
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

                                    {/* VIDEO VISUAL – looping background Vimeo */}
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
                                                }}
                                            />
                                        )}

                                        {/* Play overlay */}
                                        <div
                                            className={
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
                                                    <filter id="softGlow-recog">
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
                                                    d="M 32 19
                                                       Q 27.91 17.68 25 21
                                                       L 25 79
                                                       Q 27.91 82.32 32 81
                                                       L 85 52.5
                                                       Q 88 50 85 47.5
                                                       Z"
                                                    fill="white"
                                                    opacity="0.9"
                                                    filter="url(#softGlow-recog)"
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

                    .recog-wrap {
                        position: relative;
                        background: transparent;
                        color: #fff;
                        padding-bottom: 80px;
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
                        gap: 16px;
                        pointer-events: auto;
                    }

                    .counterBlock {
                        display: flex;
                        align-items: center;
                    }
                    .counterText {
                        font-family: 'Rajdhani', monospace;
                        font-weight: 600;
                        font-size: clamp(16px, 1.4vw, 20px);
                        line-height: 1;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: rgba(255, 255, 255, 0.85);
                        text-shadow: 0 0 8px rgba(255, 255, 255, 0.22);
                    }

                    .navBlock {
                        display: flex;
                        align-items: center;
                        gap: 8px;
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
                        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.75);
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
                    .navBtn:hover {
                        border-color: rgba(255, 255, 255, 0.8);
                        color: rgba(255, 255, 255, 1);
                        box-shadow:
                            0 0 12px rgba(255, 255, 255, 0.4),
                            0 30px 60px rgba(0, 0, 0, 0.9);
                        transform: translateY(-2px) scale(1.03);
                    }
                    .navBtn:hover .navBtnInner {
                        transform: scale(1.07);
                    }
                    .navBtn:active {
                        transform: scale(0.94);
                        transition-duration: 0.1s;
                    }

                    @media (max-width: 640px) {
                        .navBtn {
                            width: 28px;
                            height: 28px;
                        }
                        .counterText {
                            font-size: 14px;
                            letter-spacing: 0.14em;
                        }
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
                        transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
                        will-change: transform;
                        pointer-events: auto;
                    }

                    .videoCard {
                        position: absolute;
                        display: flex;
                        flex-direction: column;
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        background: rgba(0, 0, 0, 0.9);
                        box-shadow: 0 32px 88px rgba(0, 0, 0, 0.7);
                        overflow: hidden;
                        transform-origin: center;
                        z-index: 30;
                        transition:
                            transform 140ms cubic-bezier(0.22, 1, 0.36, 1),
                            box-shadow 140ms ease,
                            border-color 120ms ease,
                            background 120ms ease;
                        cursor: pointer;
                    }

                    .videoCard.teaser {
                        cursor: default;
                    }

                    .videoCard:hover {
                        transform: scale(1.04);
                        box-shadow:
                            0 32px 88px rgba(0, 0, 0, 0.7),
                            0 0 36px rgba(255, 255, 255, 0.12);
                        border-color: rgba(255, 255, 255, 0.28);
                        background: rgba(0, 0, 0, 0.95);
                    }

                    .cardCaption,
                    .cardTitleRow,
                    .cardFooter {
                        background: #080808;
                    }

                    .cardCaption {
                        position: relative;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 14px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    }

                    .capIndex,
                    .capYear {
                        font: 600 11px/1 'Rajdhani', monospace;
                        letter-spacing: 0.16em;
                        color: rgba(255, 255, 255, 0.56);
                        text-transform: uppercase;
                    }
                    .capDot {
                        width: 3px;
                        height: 3px;
                        border-radius: 999px;
                        background: rgba(255, 255, 255, 0.25);
                    }

                    .cardTitleRow {
                        padding: 10px 14px 8px 14px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    }

                    .cardTitle {
                        font-family: 'Rajdhani', monospace;
                        font-weight: 800;
                        font-size: clamp(17px, 2.4vw, 22px);
                        line-height: 1.15;
                        color: #fff;
                        margin: 0;
                        letter-spacing: 0.01em;
                    }

                    .videoVisual {
                        position: relative;
                        width: 100%;
                        aspect-ratio: 16 / 9;
                        background: #000;
                        border-top: 1px solid rgba(255, 255, 255, 0.08);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                        display: flex;
                        align-items: center;
                        justify-content: center;
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
                    .playIcon {
                        width: 180px;
                        height: 180px;
                        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
                        transform: scale(1);
                        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    .cardFooter {
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        padding: 12px 14px 14px;
                        border-top: 1px solid rgba(255, 255, 255, 0.08);
                        gap: 16px;
                        flex-wrap: wrap;
                    }

                    .videoSourceTag {
                        padding: 5px 10px;
                        font-size: 11px;
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

                    .videoSourceTag:hover {
                        color: rgba(255, 255, 255, 0.8);
                        border-color: rgba(255, 255, 255, 0.3);
                    }
                `}</style>
            </section>

            {/* ===================== FULLSCREEN MODAL ===================== */}
            {isFullscreen && fullscreenVimeoId && (
                <div
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
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsFullscreen(false);
                        }
                    }}
                >
                    <button
                        className="recogCloseBtn"
                        onClick={() => setIsFullscreen(false)}
                        aria-label="Close"
                    >
                        <div className="recogCloseIcon">
                            <span className="recogCloseLine first" />
                            <span className="recogCloseLine second" />
                        </div>
                    </button>

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
                            }}
                        />
                    </div>

                    <style jsx>{`
                        .recogCloseBtn {
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

                        .recogCloseIcon {
                            position: relative;
                            width: 20px;
                            height: 20px;
                            margin: auto;
                        }

                        .recogCloseLine {
                            position: absolute;
                            top: 50%;
                            left: 0;
                            width: 100%;
                            height: 1px;
                            background: rgba(255, 255, 255, 0.8);
                            transform-origin: center;
                            transition: transform 0.3s ease, background 0.3s ease;
                        }

                        .recogCloseLine.first {
                            transform: translateY(-50%) rotate(45deg);
                        }

                        .recogCloseLine.second {
                            transform: translateY(-50%) rotate(-45deg);
                        }

                        .recogCloseBtn:hover {
                            border-color: rgba(255, 255, 255, 0.8);
                            transform: rotate(90deg);
                        }

                        .recogCloseBtn:hover .recogCloseLine {
                            background: #ffffff;
                        }

                        @media (max-width: 768px) {
                            .recogCloseBtn {
                                top: 16px;
                                right: 16px;
                                width: 40px;
                                height: 40px;
                            }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}

/* TypeScript declaration for Vimeo Player API */
declare global {
    interface Window {
        Vimeo?: {
            Player: new (iframe: HTMLIFrameElement) => {
                on: (event: string, callback: () => void) => void;
            };
        };
    }
}
