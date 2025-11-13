'use client';

import React from 'react';
import { LineAnchor } from '@/components/00_LineAnchor';
import Image from 'next/image';

type ContactMethod = {
    id: string;
    label: string;
    value: string;
    href: string;
    type: 'email' | 'link';
};

const contactMethods: ContactMethod[] = [
    {
        id: 'linkedin',
        label: 'LINKEDIN',
        value: 'linkedin.com/in/filip-ondrej',
        href: 'https://linkedin.com/in/filip-ondrej',
        type: 'link',
    },
    {
        id: 'email',
        label: 'EMAIL',
        value: 'ondrejfilip152@gmail.com',
        href: 'mailto:ondrejfilip152@gmail.com',
        type: 'email',
    },
    {
        id: 'cal',
        label: 'BOOK A CALL',
        value: 'cal.com/filipondrej/15min',
        href: 'https://www.cal.com/filipondrej/15min',
        type: 'link',
    },
    {
        id: 'github',
        label: 'GITHUB',
        value: 'github.com/filip-ondrej',
        href: 'https://github.com/filip-ondrej',
        type: 'link',
    },
];

// Timeline images - 10 years of robotics
const timelineImages = [
    { year: '2016', age: 'AGE 12', caption: 'FIRST ROBOTICS COMPETITION', src: '/timeline/2016.jpg' },
    { year: '2017', age: 'AGE 13', caption: 'NATIONAL CHAMPION', src: '/timeline/2017.jpg' },
    { year: '2018', age: 'AGE 14', caption: 'TEAM LEADER', src: '/timeline/2018.jpg' },
    { year: '2019', age: 'AGE 15', caption: 'ROBOT MAGICIAN', src: '/timeline/2019.jpg' },
    { year: '2020', age: 'AGE 16', caption: 'MONTREAL WORLD CUP', src: '/timeline/2020.jpg' },
    { year: '2021', age: 'AGE 17', caption: 'SYDNEY 4TH PLACE', src: '/timeline/2021.jpg' },
    { year: '2022', age: 'AGE 18', caption: 'ELECTRONICS MASTERY', src: '/timeline/2022.jpg' },
    { year: '2023', age: 'AGE 19', caption: 'YOUNG CREATOR AWARD', src: '/timeline/2023.jpg' },
    { year: '2024', age: 'AGE 20', caption: 'THAILAND BEST HARDWARE', src: '/timeline/2024.jpg' },
    { year: '2025', age: 'AGE 21', caption: 'GRADUATION & FRANCE', src: '/timeline/2025.jpg' },
];

export default function ContactFooter() {
    const [vw, setVw] = React.useState(0);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useLayoutEffect(() => {
        const onR = () => setVw(window.innerWidth);
        onR();
        window.addEventListener('resize', onR);
        return () => window.removeEventListener('resize', onR);
    }, []);

    // Auto-advance every 4 seconds
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % timelineImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const INSET = Math.max(20, Math.min(vw * 0.08, 100));
    const xL = INSET;
    const xR = Math.max(INSET, vw - INSET);

    return (
        <footer className="contact-footer">
            {/* LINE ANCHORS - Top and Bottom */}
            <div className="anchors">
                <div className="anchor-top">
                    <LineAnchor id="footer-start-left" position="left" offsetX={100} />
                </div>
                <div className="anchor-bottom">
                    <LineAnchor id="footer-end-left" position="left" offsetX={100} />
                </div>
            </div>

            {/* GRID */}
            <svg className="grid" width={vw} height="100%">
                <line x1={xL} y1="0" x2={xL} y2="100%" />
                <line x1={xR} y1="0" x2={xR} y2="100%" />
                {/* Full-width horizontal line at top */}
                <line x1={xL} y1="0" x2={xR} y2="0" />
            </svg>

            {/* CONTENT */}
            <div className="content">
                {/* LEFT: Image Gallery */}
                <div className="gallery">
                    <div className="gallery-container">
                        {timelineImages.map((img, i) => (
                            <div key={img.year} className={`slide ${i === currentIndex ? 'active' : ''}`}>
                                <Image
                                    src={img.src}
                                    alt={`Robotics ${img.year}`}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority={i === 0}
                                />
                            </div>
                        ))}

                        {/* Info overlay - all on left */}
                        <div className="info">
                            <div className="age">{timelineImages[currentIndex].age}</div>
                            <div className="year">{timelineImages[currentIndex].year}</div>
                            <div className="caption">{timelineImages[currentIndex].caption}</div>
                        </div>
                    </div>

                    {/* Timeline - outside image */}
                    <div className="timeline">
                        {timelineImages.map((img, i) => (
                            <button
                                key={img.year}
                                className={`dot ${i === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(i)}
                            >
                                <span className="label">{img.year}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Contact */}
                <div className="contact">
                    {contactMethods.map((c) => (
                        <a
                            key={c.id}
                            href={c.href}
                            className="link"
                            target={c.type === 'link' ? '_blank' : undefined}
                            rel={c.type === 'link' ? 'noopener noreferrer' : undefined}
                        >
                            <span className="label">{c.label}</span>
                            <span className="value">{c.value}</span>
                            <div className="arrow">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                                </svg>
                            </div>
                        </a>
                    ))}

                    <div className="availability-badge">
                        <div className="badge-dot" />
                        <span className="badge-text">AVAILABLE FOR PROJECTS</span>
                    </div>
                </div>
            </div>

            {/* FOOTER BAR */}
            <div className="bar">
                <div className="bar-inner">
                    <span>© 2025 FILIP ONDREJ</span>
                    <span className="divider">/</span>
                    <span>10 YEARS OF ROBOTICS</span>
                    <span className="spacer" />
                    <span>DESIGNED & ENGINEERED WITH PRECISION</span>
                </div>
            </div>

            <style jsx>{`
                .contact-footer {
                    position: relative;
                    width: 100%;
                    background: transparent;
                    font-family: 'Rajdhani', monospace;
                    margin-top: 0;
                    padding-top: 0;
                }

                /* LINE ANCHORS */
                .anchors {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 25;
                }

                .anchor-top {
                    position: absolute;
                    left: 0;
                    top: 0;
                }

                .anchor-bottom {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                }

                /* GRID */
                .grid {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 0;
                }

                .grid line {
                    stroke: rgba(255, 255, 255, 0.08);
                    stroke-width: 1;
                    shape-rendering: crispEdges;
                }

                /* CONTENT */
                .content {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    padding: 0 ${INSET}px 0;
                    gap: clamp(40px, 6vw, 60px);
                    align-items: stretch;
                    margin-top: 0;
                }

                /* LEFT: Gallery */
                .gallery {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .gallery-container {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    overflow: hidden;
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    background: #000;
                }

                .slide {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transition: opacity 0.8s ease;
                }

                .slide.active {
                    opacity: 1;
                }

                .info {
                    position: absolute;
                    bottom: clamp(20px, 4vh, 30px);
                    left: clamp(20px, 4vw, 30px);
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    gap: clamp(4px, 1vh, 6px);
                    max-width: 300px;
                }

                .age {
                    font-size: clamp(10px, 1.5vw, 11px);
                    font-weight: 600;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.5);
                }

                .year {
                    font-size: clamp(40px, 7vw, 64px);
                    font-weight: 900;
                    line-height: 0.9;
                    letter-spacing: -0.02em;
                    color: rgba(255, 255, 255, 0.95);
                }

                .caption {
                    font-size: clamp(12px, 2vw, 15px);
                    font-weight: 600;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.7);
                }

                /* Timeline */
                .timeline {
                    display: flex;
                    gap: 0;
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                }

                .dot {
                    flex: 1;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: clamp(12px, 2vh, 16px) 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0;
                    border-top: 2px solid rgba(255, 255, 255, 0.1);
                    transition: border-color 0.3s ease;
                }

                .dot.active {
                    border-top-color: rgba(255, 255, 255, 0.9);
                }

                .dot:hover {
                    border-top-color: rgba(255, 255, 255, 0.3);
                }

                .dot .label {
                    font-size: clamp(9px, 1.3vw, 10px);
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    color: rgba(255, 255, 255, 0.4);
                    transition: color 0.3s ease;
                }

                .dot.active .label {
                    color: rgba(255, 255, 255, 0.9);
                }

                .dot:hover .label {
                    color: rgba(255, 255, 255, 0.7);
                }

                /* RIGHT: Contact */
                .contact {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    justify-content: flex-start;
                    margin-left: calc(-1 * clamp(40px, 6vw, 60px));
                }

                .link {
                    position: relative;
                    display: grid;
                    grid-template-columns: clamp(80px, 12vw, 100px) 1fr auto;
                    align-items: center;
                    gap: clamp(16px, 3vw, 24px);
                    padding: clamp(18px, 3vh, 22px) clamp(20px, 3vw, 32px);
                    padding-right: calc(${INSET}px + clamp(20px, 3vw, 32px));
                    text-decoration: none;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    background: transparent;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .link:first-child {
                    border-top: none;
                }

                .link::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: rgba(255, 255, 255, 0.8);
                    transform: scaleY(0);
                    transform-origin: top;
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .link:hover {
                    background: rgba(255, 255, 255, 0.03);
                    padding-left: clamp(28px, 4vw, 40px);
                }

                .link:hover::before {
                    transform: scaleY(1);
                }

                .link .label {
                    font-size: clamp(9px, 1.3vw, 10px);
                    font-weight: 600;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.4);
                    transition: color 0.3s ease;
                    grid-column: 1;
                }

                .link:hover .label {
                    color: rgba(255, 255, 255, 0.8);
                }

                .link .value {
                    font-size: clamp(17px, 2.8vw, 22px);
                    font-weight: 600;
                    letter-spacing: -0.01em;
                    color: rgba(255, 255, 255, 0.85);
                    transition: all 0.3s ease;
                    grid-column: 2;
                }

                .link:hover .value {
                    color: #fff;
                    text-shadow: 0 0 16px rgba(255, 255, 255, 0.2);
                }

                .link .arrow {
                    width: clamp(18px, 3vw, 20px);
                    height: clamp(18px, 3vw, 20px);
                    color: rgba(255, 255, 255, 0.3);
                    opacity: 0;
                    transform: translate(-8px, 0) scale(0.8);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    grid-column: 3;
                }

                .link:hover .arrow {
                    opacity: 1;
                    transform: translate(0, 0) scale(1);
                    color: rgba(255, 255, 255, 0.8);
                }

                /* Availability Badge */
                .availability-badge {
                    display: flex;
                    align-items: center;
                    gap: clamp(10px, 2vw, 12px);
                    padding: clamp(16px, 3vh, 20px) clamp(20px, 3vw, 32px);
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    width: max-content;
                    margin-top: clamp(20px, 3vh, 30px);
                    margin-left: clamp(10px, 3vw, 32px);
                }

                .badge-dot {
                    width: clamp(8px, 1.5vw, 10px);
                    height: clamp(8px, 1.5vw, 10px);
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.8);
                    box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(1.1);
                    }
                }

                .badge-text {
                    font-size: clamp(10px, 1.8vw, 11px);
                    font-weight: 600;
                    letter-spacing: 0.18em;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: uppercase;
                }

                /* FOOTER BAR */
                .bar {
                    position: relative;
                    z-index: 1;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    padding: clamp(32px, 4vh, 40px) calc(${INSET}px + clamp(30px, 5vw, 50px));
                    background: transparent;
                }

                .bar-inner {
                    display: flex;
                    align-items: center;
                    gap: clamp(12px, 2vw, 16px);
                    font-size: clamp(9px, 1.3vw, 10px);
                    font-weight: 500;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.35);
                }

                .divider {
                    color: rgba(255, 255, 255, 0.15);
                }

                .spacer {
                    flex: 1;
                }

                /* RESPONSIVE */
                @media (max-width: 1024px) {
                    .content {
                        grid-template-columns: 1fr;
                        gap: clamp(50px, 8vh, 70px);
                    }
                }

                @media (max-width: 768px) {
                    .timeline {
                        overflow-x: auto;
                        scrollbar-width: none;
                    }

                    .timeline::-webkit-scrollbar {
                        display: none;
                    }

                    .dot {
                        min-width: 50px;
                    }

                    .link {
                        grid-template-columns: 1fr;
                        gap: clamp(8px, 2vh, 10px);
                    }

                    .link .label {
                        grid-column: 1;
                    }

                    .link .value {
                        grid-column: 1;
                    }

                    .link .arrow {
                        display: none;
                    }
                }

                @media (max-width: 640px) {
                    .bar-inner {
                        flex-wrap: wrap;
                    }

                    .spacer {
                        display: none;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        transition: none !important;
                        animation: none !important;
                    }
                }
            `}</style>
        </footer>
    );
}