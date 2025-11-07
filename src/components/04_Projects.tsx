'use client';

import React from 'react';
import { LineAnchor } from '@/components/00_LineAnchor';

/* ---------- Local project data ---------- */
type ProjectItem = {
    id: string;
    title: string;
    year?: number;
    blurb: string;
    images: string[];
    tags?: string[];
};

const PROJECTS: ProjectItem[] = [
    {
        id: 'thailand-2022',
        title: 'RoboCup Thailand 2022 – Best Hardware Award',
        year: 2022,
        blurb:
            'Custom-designed autonomous rescue robot with hand-soldered PCBs, 3D-printed chassis, and advanced sensor arrays. Competed against 20+ countries and won Best Hardware Award for engineering excellence.',
        images: [
            '/images/projects/thailand.jpg',
            '/images/projects/thailand2.jpg',
        ],
        tags: ['world-class', 'pcb-design', 'embedded'],
    },
    {
        id: 'sydney-2019',
        title: 'RoboCup Sydney 2019 – 4th Place Worldwide',
        year: 2019,
        blurb:
            'Led team to 4th place finish at age 15 in virtual rescue simulation category. Programmed multi-agent coordination, A* pathfinding, and triage algorithms.',
        images: [
            '/images/projects/sydney.jpg',
            '/images/projects/sydney2.jpg',
            '/images/projects/sydney3.jpg',
            '/images/projects/sydney4.jpg',
        ],
        tags: ['multi-agent', 'pathfinding', 'world-class'],
    },
    {
        id: 'robocup-line',
        title: 'RoboCup – Rescue Line Robot',
        year: 2023,
        blurb:
            'Autonomous line-following with debris avoidance, ramp climbing and victim detection. Custom PCB design, PID control loops. Won 5 of 6 categories at nationals.',
        images: [
            '/images/projects/robocup-line.jpg',
            '/images/projects/robocup-line2.jpg',
            '/images/projects/robocup-line3.jpg',
        ],
        tags: ['robotics', 'embedded', 'pid'],
    },
    {
        id: 'heat-pump',
        title: 'Industrial Heat Pump – Diagnostic Model',
        year: 2022,
        blurb:
            'Reverse-engineered a 20-ton commercial heat pump from technical drawings. Built functional 1:200 scale model to resolve €50K+ project dispute.',
        images: [
            '/images/projects/heat-pump.png',
            '/images/projects/heat-pump-cad.png',
            '/images/projects/heat-pump-print.png',
        ],
        tags: ['mechanical', 'reverse-engineering', '3d-printing'],
    },
];

export default function Projects() {
    const sectionRef = React.useRef<HTMLElement | null>(null);
    const backdropRef = React.useRef<HTMLDivElement | null>(null);
    const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = React.useState<Record<string, number>>(
        PROJECTS.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
    );

    React.useEffect(() => {
        const root = sectionRef.current;
        if (!root) return;
        const cards = Array.from(root.querySelectorAll<HTMLElement>('.proj-card'));
        const io = new IntersectionObserver(
            (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add('in-view')),
            { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
        );
        cards.forEach((c) => io.observe(c));
        return () => io.disconnect();
    }, []);

    React.useEffect(() => {
        if (!lightboxSrc) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxSrc(null);
        };
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [lightboxSrc]);

    const handlePrevImage = (projectId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const project = PROJECTS.find((p) => p.id === projectId);
        if (!project) return;
        setCurrentImageIndex((prev) => {
            const current = prev[projectId] || 0;
            const newIndex = current === 0 ? project.images.length - 1 : current - 1;
            return { ...prev, [projectId]: newIndex };
        });
    };

    const handleNextImage = (projectId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const project = PROJECTS.find((p) => p.id === projectId);
        if (!project) return;
        setCurrentImageIndex((prev) => {
            const current = prev[projectId] || 0;
            const newIndex = current === project.images.length - 1 ? 0 : current + 1;
            return { ...prev, [projectId]: newIndex };
        });
    };

    return (
        <section ref={sectionRef} className="projects">
            {/* Top anchor */}
            <div className="pointer-events-none absolute top-0 left-0 z-50">
                <LineAnchor id="projects-top" position="left" offsetX={100} />
            </div>

            <div className="grid">
                {PROJECTS.map((p, i) => {
                    const currentImg = currentImageIndex[p.id] || 0;
                    const showArrows = p.images.length > 1;

                    return (
                        <article key={p.id} className="proj-card" style={{ animationDelay: `${i * 90}ms` }}>
                            <div className="caption">
                                <span className="index">[{String(i + 1).padStart(2, '0')}]</span>
                                <span className="dot" />
                                {typeof p.year === 'number' && <span className="year">{p.year}</span>}
                            </div>

                            <h3 className="p-title">{p.title}</h3>

                            <div className="visual-container">
                                {/* Main clickable image area */}
                                <div
                                    className="image-clickable-area"
                                    onClick={() => setLightboxSrc(p.images[currentImg])}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setLightboxSrc(p.images[currentImg]);
                                        }
                                    }}
                                    aria-label={`View ${p.title} image fullscreen`}
                                >
                                    <img src={p.images[currentImg]} alt={`${p.title} - Image ${currentImg + 1}`} />
                                </div>

                                {/* Arrow navigation overlay */}
                                {showArrows && (
                                    <>
                                        <button
                                            type="button"
                                            className="nav-arrow nav-prev"
                                            onClick={(e) => handlePrevImage(p.id, e)}
                                            aria-label="Previous image"
                                        >
                                            <svg width="20" height="160" viewBox="0 0 20 160" fill="none" preserveAspectRatio="none">
                                                <path
                                                    d="M15 16L5 80L15 144"
                                                    stroke="currentColor"
                                                    strokeLinecap="square"
                                                    strokeLinejoin="miter"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="nav-arrow nav-next"
                                            onClick={(e) => handleNextImage(p.id, e)}
                                            aria-label="Next image"
                                        >
                                            <svg width="20" height="160" viewBox="0 0 20 160" fill="none" preserveAspectRatio="none">
                                                <path
                                                    d="M5 16L15 80L5 144"
                                                    stroke="currentColor"
                                                    strokeLinecap="square"
                                                    strokeLinejoin="miter"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            </svg>
                                        </button>

                                        {/* Dots indicator */}
                                        <div className="image-dots">
                                            {p.images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className={`dot-indicator ${idx === currentImg ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setCurrentImageIndex((prev) => ({
                                                            ...prev,
                                                            [p.id]: idx,
                                                        }));
                                                    }}
                                                    aria-label={`View image ${idx + 1} of ${p.images.length}`}
                                                >
                                                    <div className="dot-inner" />
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <p className="blurb">{p.blurb}</p>

                            {p.tags && p.tags.length > 0 && (
                                <div className="tags">
                                    {p.tags.map((t) => (
                                        <span key={t} className="tag">#{t}</span>
                                    ))}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>

            {/* Bottom anchor */}
            <div className="pointer-events-none absolute bottom-20 left-0 z-50">
                <LineAnchor id="projects-bottom" position="left" offsetX={100} />
            </div>

            {/* Premium Lightbox */}
            {lightboxSrc && (
                <div
                    ref={backdropRef}
                    className="lightbox-backdrop"
                    onClick={(e) => e.target === backdropRef.current && setLightboxSrc(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="lightbox-container">
                        <img className="lightbox-image" src={lightboxSrc} alt="Project detail" />
                        <button
                            className="lightbox-close"
                            onClick={() => setLightboxSrc(null)}
                            aria-label="Close"
                        >
                            <span className="close-line" />
                            <span className="close-line" />
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .projects {
                    padding: 0;
                    position: relative;
                    background: transparent;
                    width: 100%;
                }

                .grid {
                    width: 100%;
                    margin: 0;
                    padding-left: clamp(16px, 12.5vw, 200px);
                    padding-right: clamp(16px, 12.5vw, 200px);
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(min(100%, 500px), 1fr));
                    gap: clamp(24px, 3.125vw, 65px);
                    overflow: visible;
                    position: relative;
                    isolation: isolate;
                }

                /* Force 2 columns on wider screens, 1 column on mobile */
                @media (min-width: 1200px) {
                    .grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 1199px) and (min-width: 900px) {
                    .grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 899px) {
                    .grid {
                        grid-template-columns: 1fr;
                    }
                }

                .proj-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: rgba(255, 255, 255, 0.03);
                    transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 140ms ease, border-color 120ms ease, background 120ms ease,
                    opacity 250ms ease;
                    opacity: 0;
                    transform-origin: center;
                    transform: translateZ(0) scale(1);
                    will-change: transform, box-shadow;
                    z-index: 0;
                }
                .proj-card.in-view {
                    opacity: 1;
                }

                .proj-card:hover {
                    transform: scale(1.03);
                    box-shadow: 0 32px 88px rgba(0, 0, 0, 0.7);
                    border-color: rgba(255, 255, 255, 0.28);
                    background: rgba(255, 255, 255, 0.05);
                    z-index: 50;
                }

                .proj-card::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 36px rgba(255, 255, 255, 0.12);
                    opacity: 0;
                    transition: opacity 140ms ease;
                }
                .proj-card:hover::after {
                    opacity: 1;
                }

                .caption {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .index,
                .year {
                    font: 600 11px/1 'Rajdhani', monospace;
                    letter-spacing: 0.16em;
                    color: rgba(255, 255, 255, 0.56);
                    text-transform: uppercase;
                }

                .dot {
                    width: 3px;
                    height: 3px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.25);
                }

                .p-title {
                    font: 800 clamp(17px, 2.4vw, 22px) / 1.15 'Rajdhani', monospace;
                    color: #fff;
                    margin: 10px 14px 8px 14px;
                    letter-spacing: 0.01em;
                }

                /* IMAGE CONTAINER - proper layering */
                .visual-container {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    overflow: hidden;
                    background: #000;
                }

                .image-clickable-area {
                    position: absolute;
                    inset: 0;
                    cursor: zoom-in;
                    z-index: 1;
                }

                .image-clickable-area img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: opacity 0.3s ease;
                }

                /* ARROWS */
                .nav-arrow {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    opacity: 0;
                    z-index: 10;
                }

                .nav-prev {
                    left: 0;
                    justify-content: flex-start;
                    padding-left: 18px;
                }

                .nav-next {
                    right: 0;
                    justify-content: flex-end;
                    padding-right: 18px;
                }

                .visual-container:hover .nav-arrow {
                    opacity: 1;
                }

                .nav-arrow:hover {
                    color: rgba(255, 255, 255, 0.95);
                }

                .nav-arrow:active {
                    transform: scale(0.96);
                }

                .nav-arrow svg {
                    width: 20px;
                    height: 160px;
                    stroke-width: 1.5px;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .nav-arrow:hover svg {
                    stroke-width: 2px;
                    transform: scale(1.05);
                }

                .nav-prev:hover svg {
                    transform: translateX(-3px) scale(1.05);
                }

                .nav-next:hover svg {
                    transform: translateX(3px) scale(1.05);
                }

                /* DOTS */
                .image-dots {
                    position: absolute;
                    bottom: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 6px;
                    z-index: 10;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .visual-container:hover .image-dots {
                    opacity: 1;
                }

                .dot-indicator {
                    padding: 4px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }

                .dot-indicator:hover {
                    transform: translateY(-2px);
                }

                .dot-inner {
                    width: 10px;
                    height: 10px;
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    pointer-events: none;
                }

                .dot-indicator.active .dot-inner {
                    background: rgba(255, 255, 255, 0.9);
                    border-color: rgba(255, 255, 255, 0.9);
                    box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
                    transform: scale(1.2);
                }

                .dot-indicator:hover .dot-inner {
                    background: rgba(255, 255, 255, 0.4);
                    border-color: rgba(255, 255, 255, 0.6);
                }

                .blurb {
                    padding: 12px 14px 0;
                    font: 400 15px/1.6 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.84);
                    margin: 0;
                    flex: 1;
                }

                /* TAG STYLE */
                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: clamp(10px, 2vw, 12px);
                    padding: 10px 14px 14px;
                }

                .tag {
                    padding: clamp(5px, 1vw, 6px) clamp(10px, 2vw, 12px);
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    font: 400 clamp(9px, 2vw, 11px)/1 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 0.08em;
                    text-transform: lowercase;
                    transition: all 0.3s ease;
                }

                .tag:hover {
                    color: rgba(255, 255, 255, 0.8);
                    border-color: rgba(255, 255, 255, 0.3);
                }

                /* LIGHTBOX */
                .lightbox-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                    animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
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
                    }
                }

                .lightbox-image {
                    max-width: 100%;
                    max-height: 90vh;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 50px 100px rgba(0, 0, 0, 0.8);
                }

                .lightbox-close {
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

                .lightbox-close:hover {
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

                .lightbox-close:hover .close-line {
                    background: #ffffff;
                }

                .close-line:first-child {
                    transform: rotate(45deg);
                }

                .close-line:last-child {
                    transform: rotate(-45deg);
                }

                /* TABLET - still 2 columns */
                @media (max-width: 1024px) {
                    .lightbox-close {
                        top: 20px;
                        right: 20px;
                    }
                }

                /* MOBILE - 1 column */
                @media (max-width: 768px) {
                    .grid {
                        padding-left: clamp(16px, 5vw, 40px);
                        padding-right: clamp(16px, 5vw, 40px);
                        gap: clamp(24px, 4vw, 40px);
                    }

                    .nav-arrow {
                        opacity: 1;
                        width: 60px;
                    }

                    .image-dots {
                        opacity: 1;
                    }
                }

                @media (max-width: 640px) {
                    .grid {
                        padding-left: 16px;
                        padding-right: 16px;
                    }

                    .proj-card:active {
                        transform: scale(0.98);
                    }

                    .lightbox-close {
                        top: 10px;
                        right: 10px;
                        width: 40px;
                        height: 40px;
                    }

                    .lightbox-image {
                        max-width: 95vw;
                        max-height: 85vh;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        transition: none !important;
                        animation: none !important;
                    }
                }
            `}</style>
        </section>
    );
}