'use client';

import React from 'react';

type VideoItem = {
    id: string;
    title: string;
    source: string; // e.g. "TECHCONF"
    date: string;   // e.g. "2024-11"
    url: string;
    year?: number;  // we’ll surface year in the caption bar like projects
};

const VIDEOS: VideoItem[] = [
    {
        id: 'a',
        title: 'Keynote: Autonomous Sites',
        source: 'TECHCONF',
        date: '2024-11',
        year: 2024,
        url: 'https://youtube.com/watch?v=AAAA',
    },
    {
        id: 'b',
        title: 'National TV Feature',
        source: 'NAT-TV',
        date: '2024-06',
        year: 2024,
        url: 'https://youtube.com/watch?v=BBBB',
    },
    {
        id: 'c',
        title: 'Interview w/ Press',
        source: 'DAILY JOURNAL',
        date: '2024-03',
        year: 2024,
        url: 'https://youtube.com/watch?v=CCCC',
    },
    {
        id: 'd',
        title: 'AI + Robotics Panel',
        source: 'FUTURE LAB',
        date: '2023-12',
        year: 2023,
        url: 'https://youtube.com/watch?v=DDDD',
    },
    {
        id: 'e',
        title: 'Award Speech',
        source: 'ROBOCUP INTL',
        date: '2023-07',
        year: 2023,
        url: 'https://youtube.com/watch?v=EEEE',
    },
];

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

    // same responsive gutters we’ve been using
    const INSET = vw <= 640 ? 40 : vw <= 1024 ? 60 : 100;
    const TITLE_OFFSET = 40;

    // cage constants
    const TOP_Y = 200;
    const EXTRA_BOTTOM_SPACE = 200;
    const MID_RATIO = 0.5;
    const CAP_OFFSET = 60;

    // frame aspect ratio 16:11 (the outer cage box, not the video)
    const ASPECT_W = 16;
    const ASPECT_H = 11;

    // x positions
    const xL = INSET;
    const xR = Math.max(INSET, vw - INSET);
    const xM = xL + (xR - xL) * MID_RATIO;

    // frame width and height
    const frameWidth = xM - xL;
    const frameHeight = frameWidth * (ASPECT_H / ASPECT_W);

    // y coords
    const yTop = TOP_Y;
    const yBottom = yTop + frameHeight;
    const yCap = yTop - CAP_OFFSET;

    // svg total height to reserve space
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

    // helper to loop indices
    const wrapIndex = (idx: number) => {
        const m = idx % total;
        return m < 0 ? m + total : m;
    };

    /* ---------------------------------
       scroll-trigger title reveal
    --------------------------------- */
    const sectionRef = React.useRef<HTMLElement | null>(null);
    const [titleVisible, setTitleVisible] = React.useState(false);

    React.useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const onScroll = () => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.8) {
                setTitleVisible(true);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* ---------------------------------
       header band geometry
    --------------------------------- */
    const headerX = xL;
    const headerY = yCap;
    const headerW = frameWidth;
    const headerH = yTop - yCap;
    const headerPadX = 16;
    const headerPadY = 8;

    /* ---------------------------------
       title positioning
    --------------------------------- */
    // sit the big title halfway between top of section (0) and yCap
    const titleLeft = xL + TITLE_OFFSET;
    const titleTop = yCap / 2;

    /* ---------------------------------
       card sizing inside frame
    --------------------------------- */
    // cards scale to 90% of cage, centered
    const CARD_SCALE = 0.9;
    const cardOuterW = frameWidth * CARD_SCALE;
    const cardOuterH = frameHeight * CARD_SCALE;
    const cardOffsetX = (frameWidth - cardOuterW) / 2;
    const cardOffsetY = (frameHeight - cardOuterH) / 2;

    /* ---------------------------------
       viewport / track geometry
    --------------------------------- */
    // we widen viewport to 3 * frameWidth.
    // that gives:
    // - left peek of previous
    // - first full (current)
    // - second full (next)
    // - third mostly full (next+1)
    // - start of next+2 creeping in
    const viewportW = frameWidth * 3;

    // full carousel track is all videos in some logical loop order
    const trackW = frameWidth * total;

    // how far to shift the track:
    // we place cards in a circular order so "slot 1" = current,
    // "slot 2" = next, etc.
    //
    // we want current (slot 1) a little bit from the left edge of viewport
    // so we can ALSO see previous (slot 0) peeking.
    //
    // we do `(currentSlide + 1) * frameWidth`
    //  -> slot0 (prev) ends up slightly visible on the far left,
    //     slot1 (current) lands in the first full cage,
    //     slot2 (next) in second cage,
    //     slot3 (next+1) mostly visible,
    //     slot4 (next+2) begins to creep.
    const trackTranslateX = (currentSlide + 1) * frameWidth;

    /* ---------------------------------
       slot mapping
    --------------------------------- */
    // we want visual slots in this loop order:
    //   slot 0  = currentSlide - 1   (previous teaser left)
    //   slot 1  = currentSlide       (current, fully visible / clickable)
    //   slot 2  = currentSlide + 1   (next, fully visible / clickable)
    //   slot 3  = currentSlide + 2   (next+1, mostly visible teaser on right)
    //   slot 4  = currentSlide + 3   (next+2, creeping in far right)
    //
    // to make that happen for each raw index, we assign it a "slot"
    // relative to currentSlide. logic below does this.

    return (
        <section ref={sectionRef} className="recog-wrap">
            {/* ===================== STATIC GRID LINES ===================== */}
            <svg
                className="gridSvg"
                width={vw}
                height={svgHeight}
                style={{ height: svgHeight }}
            >
                {/* left spine (0 -> bottom of cage) */}
                <line
                    x1={xL}
                    y1={0}
                    x2={xL}
                    y2={yBottom}
                    className="gridLine"
                />

                {/* middle spine (just cage vertical split) */}
                <line
                    x1={xM}
                    y1={yTop}
                    x2={xM}
                    y2={yBottom}
                    className="gridLine"
                />

                {/* far right spine continues all the way down */}
                <line
                    x1={xR}
                    y1={yTop}
                    x2={xR}
                    y2={svgHeight}
                    className="gridLine"
                />

                {/* cage horizontal lines stretching to the viewport right edge */}
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

                {/* header band lines above cage */}
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

            {/* ===================== BIG TITLE ===================== */}
            <div
                className={`recog-titleWrap ${titleVisible ? 'visible' : ''}`}
                style={{
                    left: titleLeft,
                    top: titleTop,
                    transform: 'translateY(-50%)',
                }}
            >
                <h2 className="recog-title">
                    <span className="recog-title-line">
                        <span className="recog-title-word">Press</span>{' '}
                        <span className="recog-title-word">&</span>{' '}
                        <span className="recog-title-word">Recognition</span>
                    </span>
                </h2>
            </div>

            {/* ===================== HEADER BAND (COUNTER + NAV) ===================== */}
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
                                    width="20"
                                    height="20"
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
                                    width="20"
                                    height="20"
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
                {/* moving belt */}
                <div
                    className="carouselTrack"
                    style={{
                        width: trackW,
                        height: frameHeight,
                        transform: `translateX(-${trackTranslateX}px)`,
                    }}
                >
                    {VIDEOS.map((vid, rawIndex) => {
                        // figure out which "slot" this vid should occupy visually
                        // relative to currentSlide
                        // delta from current
                        const delta = rawIndex - currentSlide;
                        // slotIndex = delta + 1 (so currentSlide => slot 1)
                        let slot = delta + 1;
                        if (slot < 0) slot += total;
                        if (slot >= total) slot -= total;

                        // horizontal position of this slot in the track
                        const frameLeft = slot * frameWidth;

                        // clickable if slot === 1 (current full) or slot === 2 (next full)
                        const isClickable = slot === 1 || slot === 2;

                        // label numbering for caption like projects:
                        // we'll take rawIndex (0-based) and show [01], [02], etc.
                        const indexLabel = String(rawIndex + 1).padStart(
                            2,
                            '0'
                        );

                        return (
                            <article
                                key={vid.id + '-' + rawIndex}
                                className={`videoCard ${
                                    isClickable ? 'clickable' : 'teaser'
                                }`}
                                style={{
                                    left: frameLeft + cardOffsetX,
                                    top: cardOffsetY,
                                    width: cardOuterW,
                                    height: cardOuterH,
                                }}
                                onClick={
                                    isClickable
                                        ? () => {
                                            console.log(
                                                'OPEN VIDEO:',
                                                vid.url
                                            );
                                        }
                                        : undefined
                                }
                            >
                                {/* ===== caption bar (like .caption in Projects) ===== */}
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

                                    {/* little "close-ish" icon group top-right (like lightbox close vibe) */}
                                    <button
                                        className="miniClose"
                                        tabIndex={-1}
                                        aria-hidden="true"
                                    >
                                        <span className="miniCloseLine" />
                                        <span className="miniCloseLine" />
                                    </button>
                                </div>

                                {/* ===== title row (like .p-title in Projects) ===== */}
                                <h3 className="cardTitle">{vid.title}</h3>

                                {/* ===== VIDEO VISUAL (16:9 area) ===== */}
                                <div className="videoVisual">
                                    <div className="videoPlaceholder">
                                        <span className="phText">
                                            16:9 VIDEO
                                        </span>
                                    </div>
                                </div>

                                {/* ===== FOOTER META ROW ===== */}
                                <div className="cardFooter">
                                    <span className="videoSourceTag">
                                        {vid.source}
                                    </span>
                                    <span className="videoDateText">
                                        {vid.date}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            {/* spacer so content below this section doesn't overlap absolute stuff */}
            <div style={{ height: svgHeight }} />

            <style jsx>{`
                .recog-wrap {
                    position: relative;
                    background: transparent;
                    color: #fff;
                    padding-top: 40px;
                    padding-bottom: 80px;
                    overflow-x: hidden;
                    font-family: 'Rajdhani', monospace;
                }

                /* GRID LINES */
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

                /* TITLE */
                .recog-titleWrap {
                    position: absolute;
                    z-index: 5;
                    pointer-events: none;
                    overflow: hidden;
                }
                .recog-title {
                    margin: 0;
                    font-weight: 700;
                    font-family: 'Rajdhani', monospace;
                    font-size: clamp(36px, 5.5vw, 76px);
                    line-height: 0.95;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.88);
                }
                .recog-title-line {
                    display: block;
                    overflow: hidden;
                }
                .recog-title-word {
                    display: inline-block;
                    transform: translateY(100%);
                    opacity: 0;
                    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                    opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                }
                .recog-title-word::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.3);
                    transition: width 0.5s ease;
                }
                .recog-titleWrap:hover .recog-title-word::after {
                    width: 100%;
                }
                .recog-titleWrap.visible .recog-title-word {
                    transform: translateY(0%);
                    opacity: 1;
                }
                .recog-titleWrap.visible
                .recog-title-word:nth-child(1) {
                    transition-delay: 0.1s;
                }
                .recog-titleWrap.visible
                .recog-title-word:nth-child(2) {
                    transition-delay: 0.2s;
                }
                .recog-titleWrap.visible
                .recog-title-word:nth-child(3) {
                    transition-delay: 0.3s;
                }

                /* HEADER BAND (COUNTER + NAV) */
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
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    position: relative;
                    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.75);
                    transition: border-color 0.3s
                    cubic-bezier(0.16, 1, 0.3, 1),
                    box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .navBtnInner {
                    width: 100%;
                    height: 100%;
                    display: grid;
                    place-items: center;
                    transition: transform 0.3s
                    cubic-bezier(0.16, 1, 0.3, 1);
                }
                .navBtn:hover {
                    border-color: rgba(255, 255, 255, 0.8);
                    color: rgba(255, 255, 255, 1);
                    box-shadow: 0 0 12px
                    rgba(255, 255, 255, 0.4),
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

                /* CAROUSEL VIEWPORT */
                .carouselViewport {
                    position: absolute;
                    z-index: 20;
                    overflow: hidden;
                    pointer-events: none; /* article handles its own click */
                }

                /* TRACK (belt of cards) */
                .carouselTrack {
                    position: absolute;
                    left: 0;
                    top: 0;
                    display: block;
                    transition: transform 0.9s
                    cubic-bezier(0.16, 1, 0.3, 1); /* slowed down */
                    will-change: transform;
                }

                /* CARD (Project-style frame) */
                .videoCard {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid
                    rgba(255, 255, 255, 0.12);
                    background: rgba(
                            255,
                            255,
                            255,
                            0.03
                    ); /* subtle like projects */
                    box-shadow: 0 32px 88px
                    rgba(0, 0, 0, 0.7);
                    overflow: hidden;
                    transform-origin: center;
                    transition: transform 140ms
                    cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 140ms ease,
                    border-color 120ms ease,
                    background 120ms ease;
                    pointer-events: auto;
                }

                /* cards fully in cage are clickable */
                .videoCard.clickable {
                    cursor: pointer;
                }

                /* peeking cards still hover-scale but aren’t clickable */
                .videoCard.teaser {
                    cursor: default;
                }

                /* hover grow */
                .videoCard:hover {
                    transform: scale(1.04);
                }

                /* clickable hover glow */
                .videoCard.clickable:hover {
                    box-shadow: 0 32px 88px
                    rgba(0, 0, 0, 0.7),
                    0 0 36px
                    rgba(255, 255, 255, 0.12);
                    border-color: rgba(
                            255,
                            255,
                            255,
                            0.28
                    );
                    background: rgba(
                            255,
                            255,
                            255,
                            0.05
                    );
                }

                /* teaser hover = softer */
                .videoCard.teaser:hover {
                    box-shadow: 0 24px 64px
                    rgba(0, 0, 0, 0.6);
                    border-color: rgba(
                            255,
                            255,
                            255,
                            0.18
                    );
                    background: rgba(
                            255,
                            255,
                            255,
                            0.04
                    );
                }

                /* CAPTION BAR (like .caption in Projects) */
                .cardCaption {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px 8px 14px;
                    border-bottom: 1px solid
                    rgba(255, 255, 255, 0.08);
                    background: rgba(
                            0,
                            0,
                            0,
                            0.35
                    );
                }

                .capIndex {
                    font: 600 11px/1 'Rajdhani',
                    monospace;
                    letter-spacing: 0.16em;
                    color: rgba(
                            255,
                            255,
                            255,
                            0.56
                    );
                    text-transform: uppercase;
                }

                .capDot {
                    width: 3px;
                    height: 3px;
                    border-radius: 999px;
                    background: rgba(
                            255,
                            255,
                            255,
                            0.25
                    );
                }

                .capYear {
                    font: 600 11px/1 'Rajdhani',
                    monospace;
                    letter-spacing: 0.16em;
                    color: rgba(
                            255,
                            255,
                            255,
                            0.56
                    );
                    text-transform: uppercase;
                }

                /* little x/close glyph in caption top-right, like a UI chrome element */
                .miniClose {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 16px;
                    height: 16px;
                    background: transparent;
                    border: 0;
                    padding: 0;
                    cursor: default;
                    pointer-events: none;
                }
                .miniCloseLine {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: rgba(
                            255,
                            255,
                            255,
                            0.4
                    );
                }
                .miniCloseLine:first-child {
                    transform: translateY(-50%)
                    rotate(45deg);
                }
                .miniCloseLine:last-child {
                    transform: translateY(-50%)
                    rotate(-45deg);
                }

                /* TITLE ROW (like .p-title in projects) */
                .cardTitle {
                    font-family: 'Rajdhani',
                    monospace;
                    font-weight: 800;
                    font-size: clamp(
                            17px,
                            2.4vw,
                            22px
                    );
                    line-height: 1.15;
                    color: #fff;
                    margin: 10px 14px 8px 14px;
                    letter-spacing: 0.01em;
                }

                /* VIDEO VISUAL (16:9 media window) */
                .videoVisual {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    background: #000;
                    border-top: 1px solid
                    rgba(255, 255, 255, 0.08);
                    border-bottom: 1px solid
                    rgba(255, 255, 255, 0.08);

                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .videoPlaceholder {
                    color: rgba(
                            255,
                            255,
                            255,
                            0.4
                    );
                    font-size: 12px;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    font-family: 'Rajdhani',
                    monospace;
                    text-align: center;
                    line-height: 1.4;
                    user-select: none;
                    pointer-events: none;
                }
                .phText {
                    opacity: 0.6;
                }

                /* FOOTER META ROW
                   replaces description + tag list in Projects */
                .cardFooter {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 14px 14px;
                    background: rgba(
                            0,
                            0,
                            0,
                            0.4
                    );
                    border-top: 1px solid
                    rgba(255, 255, 255, 0.08);
                    gap: 16px;
                    flex-wrap: wrap;
                }

                /* left pill = source */
                .videoSourceTag {
                    padding: 8px 10px 7px;
                    font-size: 11px;
                    font-weight: 600;
                    line-height: 1;
                    letter-spacing: 0.16em;
                    color: rgba(
                            255,
                            255,
                            255,
                            0.8
                    );
                    border: 1px solid
                    rgba(255, 255, 255, 0.12);
                    background: rgba(
                            0,
                            0,
                            0,
                            0.35
                    );
                    text-transform: uppercase;
                    white-space: nowrap;
                }

                /* right = date */
                .videoDateText {
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 1;
                    letter-spacing: 0.05em;
                    color: rgba(
                            255,
                            255,
                            255,
                            0.7
                    );
                    white-space: nowrap;
                }
            `}</style>
        </section>
    );
}
