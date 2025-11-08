'use client';

import React from 'react';
import { LineAnchor } from '@/components/00_LineAnchor';

type ContactMethod = {
    id: string;
    label: string;
    value: string;
    href: string;
    type: 'email' | 'link' | 'location';
};

const contactMethods: ContactMethod[] = [
    {
        id: 'email',
        label: 'EMAIL',
        value: 'hello@filipkral.com',
        href: 'mailto:hello@filipkral.com',
        type: 'email',
    },
    {
        id: 'linkedin',
        label: 'LINKEDIN',
        value: 'linkedin.com/in/filipkral',
        href: 'https://linkedin.com/in/filipkral',
        type: 'link',
    },
    {
        id: 'github',
        label: 'GITHUB',
        value: 'github.com/filipkral',
        href: 'https://github.com/filipkral',
        type: 'link',
    },
];

export default function ContactFooter() {
    const [vw, setVw] = React.useState(0);
    const [hoveredContact, setHoveredContact] = React.useState<string | null>(null);

    React.useLayoutEffect(() => {
        const onR = () => setVw(window.innerWidth);
        onR();
        window.addEventListener('resize', onR);
        return () => window.removeEventListener('resize', onR);
    }, []);

    const INSET = Math.max(20, Math.min(vw * 0.08, 100));
    const xL = INSET;
    const xR = Math.max(INSET, vw - INSET);
    const xM = xL + (xR - xL) * 0.5;

    const HEADER_HEIGHT = 60;
    const CONTACT_AREA_HEIGHT = 'clamp(400px, 50vh, 600px)';

    return (
        <footer className="contact-footer">
            {/* LINE ANCHORS */}
            <div className="pointer-events-none absolute inset-0 z-[25]">
                <div className="absolute left-0 top-[12px]">
                    <LineAnchor id="footer-start-left" position="left" offsetX={100} />
                </div>
                <div className="absolute right-0 top-[12px]">
                    <LineAnchor id="footer-start-right" position="right" offsetX={100} />
                </div>
                <div className="absolute left-0 bottom-[60px]">
                    <LineAnchor id="footer-end-left" position="left" offsetX={100} />
                </div>
                <div className="absolute right-0 bottom-[60px]">
                    <LineAnchor id="footer-end-right" position="right" offsetX={100} />
                </div>
            </div>

            {/* GRID LINES */}
            <svg className="footer-grid" width={vw} height="100%">
                <line x1={xL} y1={HEADER_HEIGHT} x2={xL} y2="100%" className="grid-line" />
                <line x1={xM} y1={HEADER_HEIGHT} x2={xM} y2="100%" className="grid-line" />
                <line x1={xR} y1={HEADER_HEIGHT} x2={xR} y2="100%" className="grid-line" />
                <line x1={xL} y1={HEADER_HEIGHT} x2={xR} y2={HEADER_HEIGHT} className="grid-line" />
            </svg>

            {/* MAIN CONTENT AREA */}
            <div className="footer-main" style={{ height: CONTACT_AREA_HEIGHT }}>
                {/* LEFT: Big Title */}
                <div className="footer-left">
                    <div className="title-container">
                        <h2 className="footer-title">
                            <span className="title-word">LET'S</span>
                            <span className="title-word">WORK</span>
                            <span className="title-word">TOGETHER</span>
                        </h2>
                        <div className="title-underline" />
                    </div>

                    <p className="footer-tagline">
                        Open to collaborations, consulting,<br />
                        and full-time opportunities
                    </p>
                </div>

                {/* RIGHT: Contact Links */}
                <div className="footer-right">
                    <div className="contact-list">
                        {contactMethods.map((method, index) => (
                            <a
                                key={method.id}
                                href={method.href}
                                className={`contact-link ${hoveredContact === method.id ? 'hovered' : ''}`}
                                onMouseEnter={() => setHoveredContact(method.id)}
                                onMouseLeave={() => setHoveredContact(null)}
                                target={method.type === 'link' ? '_blank' : undefined}
                                rel={method.type === 'link' ? 'noopener noreferrer' : undefined}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <span className="contact-label">{method.label}</span>
                                <span className="contact-value">{method.value}</span>
                                <div className="contact-arrow">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                                    </svg>
                                </div>
                            </a>
                        ))}
                    </div>

                    <div className="availability-badge">
                        <div className="badge-dot" />
                        <span className="badge-text">AVAILABLE FOR PROJECTS</span>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="footer-bottom">
                <div className="bottom-content" style={{ padding: `0 ${INSET}px` }}>
                    <div className="bottom-left">
                        <span className="bottom-item">© 2025 FILIP KRAL</span>
                        <span className="bottom-divider">/</span>
                        <span className="bottom-item">HAMBURG, GERMANY</span>
                    </div>
                    <div className="bottom-right">
                        <span className="bottom-item">DESIGNED & ENGINEERED WITH PRECISION</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .contact-footer {
                    position: relative;
                    width: 100%;
                    min-height: clamp(600px, 70vh, 800px);
                    background: transparent;
                    font-family: 'Rajdhani', monospace;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .footer-grid {
                    position: absolute;
                    left: 0;
                    top: 0;
                    pointer-events: none;
                    z-index: 0;
                }

                .grid-line {
                    stroke: rgba(255, 255, 255, 0.12);
                    stroke-width: 1;
                    shape-rendering: crispEdges;
                }

                /* MAIN CONTENT AREA */
                .footer-main {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: clamp(40px, 8vw, 100px);
                    padding: clamp(60px, 10vh, 120px) ${INSET}px clamp(60px, 10vh, 120px);
                    align-items: center;
                    flex: 1;
                }

                /* LEFT SIDE - Title */
                .footer-left {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(30px, 5vh, 50px);
                    opacity: 0;
                    animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
                }

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .title-container {
                    position: relative;
                }

                .footer-title {
                    font-size: clamp(42px, 7vw, 96px);
                    font-weight: 900;
                    line-height: 0.95;
                    letter-spacing: -0.02em;
                    color: #fff;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: clamp(4px, 1vh, 8px);
                }

                .title-word {
                    display: block;
                    position: relative;
                }

                .title-underline {
                    margin-top: clamp(16px, 3vh, 24px);
                    width: clamp(80px, 15vw, 160px);
                    height: 3px;
                    background: linear-gradient(90deg,
                    rgba(255, 255, 255, 0.8) 0%,
                    rgba(255, 255, 255, 0.3) 100%
                    );
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                }

                .footer-tagline {
                    font-size: clamp(15px, 2.5vw, 20px);
                    font-weight: 400;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0;
                    max-width: 400px;
                }

                /* RIGHT SIDE - Contact List */
                .footer-right {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(30px, 5vh, 50px);
                    opacity: 0;
                    animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .contact-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .contact-link {
                    position: relative;
                    display: grid;
                    grid-template-columns: clamp(80px, 15vw, 120px) 1fr auto;
                    align-items: center;
                    gap: clamp(16px, 3vw, 24px);
                    padding: clamp(20px, 3.5vh, 28px) clamp(20px, 3vw, 32px);
                    text-decoration: none;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    background: transparent;
                }

                .contact-link:last-child {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .contact-link::before {
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

                .contact-link:hover {
                    background: rgba(255, 255, 255, 0.03);
                    padding-left: clamp(28px, 4vw, 40px);
                }

                .contact-link:hover::before {
                    transform: scaleY(1);
                }

                .contact-label {
                    font-size: clamp(10px, 1.8vw, 11px);
                    font-weight: 600;
                    letter-spacing: 0.2em;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    transition: color 0.3s ease;
                }

                .contact-link:hover .contact-label {
                    color: rgba(255, 255, 255, 0.8);
                }

                .contact-value {
                    font-size: clamp(16px, 3vw, 22px);
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.85);
                    letter-spacing: -0.01em;
                    transition: all 0.3s ease;
                }

                .contact-link:hover .contact-value {
                    color: #fff;
                    text-shadow: 0 0 16px rgba(255, 255, 255, 0.2);
                }

                .contact-arrow {
                    width: clamp(18px, 3vw, 20px);
                    height: clamp(18px, 3vw, 20px);
                    color: rgba(255, 255, 255, 0.3);
                    opacity: 0;
                    transform: translate(-8px, 0) scale(0.8);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .contact-link:hover .contact-arrow {
                    opacity: 1;
                    transform: translate(0, 0) scale(1);
                    color: rgba(255, 255, 255, 0.8);
                }

                /* Availability Badge */
                .availability-badge {
                    display: flex;
                    align-items: center;
                    gap: clamp(10px, 2vw, 12px);
                    padding: clamp(12px, 2vh, 16px) clamp(20px, 3vw, 24px);
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    width: max-content;
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

                /* BOTTOM BAR */
                .footer-bottom {
                    position: relative;
                    z-index: 1;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    padding: clamp(20px, 3vh, 30px) 0;
                    margin-top: auto;
                }

                .bottom-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: clamp(20px, 4vw, 40px);
                }

                .bottom-left,
                .bottom-right {
                    display: flex;
                    align-items: center;
                    gap: clamp(10px, 2vw, 16px);
                    font-size: clamp(9px, 1.6vw, 10px);
                    letter-spacing: 0.15em;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    font-weight: 500;
                }

                .bottom-divider {
                    color: rgba(255, 255, 255, 0.2);
                }

                /* RESPONSIVE */
                @media (max-width: 968px) {
                    .footer-main {
                        grid-template-columns: 1fr;
                        gap: clamp(50px, 8vh, 80px);
                        padding: clamp(50px, 8vh, 80px) ${INSET}px;
                    }

                    .footer-title {
                        font-size: clamp(36px, 10vw, 72px);
                    }

                    .contact-link {
                        grid-template-columns: 1fr;
                        gap: clamp(8px, 2vh, 12px);
                    }

                    .contact-label {
                        order: 1;
                    }

                    .contact-value {
                        order: 2;
                    }

                    .contact-arrow {
                        display: none;
                    }
                }

                @media (max-width: 640px) {
                    .bottom-content {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: clamp(12px, 2vh, 16px);
                    }

                    .bottom-left,
                    .bottom-right {
                        flex-wrap: wrap;
                    }

                    .availability-badge {
                        width: 100%;
                        justify-content: center;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .footer-left,
                    .footer-right {
                        animation: none;
                        opacity: 1;
                    }

                    .badge-dot {
                        animation: none;
                    }

                    * {
                        transition: none !important;
                    }
                }
            `}</style>
        </footer>
    );
}