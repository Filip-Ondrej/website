'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

// ==================== TYPES ====================
export type AchievementData = {
    id: string;
    title: string;
    date: string;
    age?: number;
    location?: string;
    images: string[];
    videos?: string[];
    tags: string[];
    hook: string;
    pullQuote: string;
    challenge: string;
    outcome: string;
    metrics: string[];
    story: string;
    insight: string;
};

type Props = {
    data: AchievementData | null;
    isOpen: boolean;
    onClose: () => void;
};

// ==================== COMPONENT ====================
export default function AchievementModal({ data, isOpen, onClose }: Props) {
    const backdropRef = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = React.useState(0);
    const [activeSection, setActiveSection] = React.useState(0);
    const [isReading, setIsReading] = React.useState(false);
    const [timeSpent, setTimeSpent] = React.useState(0);

    // Track reading state
    React.useEffect(() => {
        if (!isOpen) {
            setTimeSpent(0);
            setIsReading(false);
            return;
        }

        let scrollTimer: NodeJS.Timeout;
        const handleScroll = () => {
            setIsReading(true);
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => setIsReading(false), 150);
        };

        const container = containerRef.current;
        container?.addEventListener('scroll', handleScroll);

        // Time tracking
        const timer = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);

        return () => {
            container?.removeEventListener('scroll', handleScroll);
            clearInterval(timer);
            clearTimeout(scrollTimer);
        };
    }, [isOpen]);

    React.useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        // Handle arrow key navigation
        const handleArrowKeys = (e: KeyboardEvent) => {
            const container = containerRef.current;
            if (!container) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                container.scrollBy({ top: 100, behavior: 'smooth' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                container.scrollBy({ top: -100, behavior: 'smooth' });
            }
        };

        document.addEventListener('keydown', handleEsc);
        document.addEventListener('keydown', handleArrowKeys);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.removeEventListener('keydown', handleArrowKeys);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    React.useEffect(() => {
        if (!isOpen) return;

        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrolled = container.scrollTop;
            const total = container.scrollHeight - container.clientHeight;
            const progress = Math.min(1, scrolled / total);
            setScrollProgress(progress);

            // Determine active section
            const sections = container.querySelectorAll('.story-section');
            let current = 0;
            sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 200) current = index;
            });
            setActiveSection(current);
        };

        // Intersection Observer for reveal animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');

                        // Trigger counter animation for metrics
                        if (entry.target.classList.contains('metric-badge')) {
                            const el = entry.target as HTMLElement;
                            const finalText = el.dataset.value || el.textContent || '';
                            animateValue(el, finalText);
                        }
                    }
                });
            },
            { threshold: 0.1 }
        );

        const sections = container.querySelectorAll('.story-section, .metric-badge, .story-image');
        sections.forEach((section) => observer.observe(section));

        container.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call

        return () => {
            container.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, [isOpen]);

    // Animate metric values
    const animateValue = (element: HTMLElement, value: string) => {
        const match = value.match(/(\d+)/);
        if (!match) {
            element.textContent = value;
            return;
        }

        const num = parseInt(match[1]);
        const prefix = value.substring(0, match.index || 0);
        const suffix = value.substring((match.index || 0) + match[1].length);

        let current = 0;
        const increment = num / 20;
        const timer = setInterval(() => {
            current += increment;
            if (current >= num) {
                current = num;
                clearInterval(timer);
            }
            element.textContent = prefix + Math.floor(current) + suffix;
        }, 50);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    if (!isOpen || !data) return null;

    // Format time spent
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Section navigation
    const sections = [
        { name: 'Intro', id: 'hero' },
        { name: 'Stakes', id: 'stakes' },
        { name: 'Story', id: 'story' },
        { name: 'Insight', id: 'insight' }
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div
            ref={backdropRef}
            className="achievement-modal-backdrop"
            onClick={handleBackdropClick}
        >
            {/* Reading indicator */}
            <div className={`reading-indicator ${isReading ? 'active' : ''}`}>
                <div className="reading-bar" />
            </div>

            {/* Progress system with sections */}
            <div className="progress-system">
                <div className="progress-bar" style={{ width: `${scrollProgress * 100}%` }} />
                <div className="section-dots">
                    {sections.map((section, i) => (
                        <button
                            key={section.id}
                            className={`section-dot ${i <= activeSection ? 'active' : ''}`}
                            onClick={() => scrollToSection(section.id)}
                            title={section.name}
                        >
                            <span className="section-label">{section.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Time spent indicator */}
            <div className="time-indicator">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                </svg>
                {formatTime(timeSpent)}
            </div>

            {/* Close button */}
            <button className="close-btn" onClick={onClose} aria-label="Close">
                <div className="close-icon">
                    <span />
                    <span />
                </div>
            </button>

            <div ref={containerRef} className="achievement-modal-container">
                {/* HERO */}
                <div id="hero" className="hero-section">
                    {data.images[0] && (
                        <>
                            <img src={data.images[0]} alt={data.title} className="hero-image" />
                            <div className="hero-overlay" />
                            <div className="hero-grid" />
                        </>
                    )}

                    <div className="hero-content">
                        <div className="hero-meta">
                            <span className="meta-item">{data.date}</span>
                            {data.age && <span className="meta-divider">/</span>}
                            {data.age && <span className="meta-item">AGE {data.age}</span>}
                            {data.location && <span className="meta-divider">/</span>}
                            {data.location && <span className="meta-item">{data.location}</span>}
                        </div>

                        <h1 className="hero-title">
                            <span className="title-word">{data.title}</span>
                        </h1>

                        <p className="hero-hook">{data.hook}</p>
                    </div>
                </div>

                {/* STAKES */}
                <div id="stakes" className="story-section stakes-section">
                    <div className="section-header">
                        <span className="section-number">01</span>
                        <span className="section-title">THE STAKES</span>
                    </div>

                    <div className="stakes-container">
                        <div className="stake-card challenge">
                            <div className="stake-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                            </div>
                            <div className="stake-label">Challenge</div>
                            <p>{data.challenge}</p>
                        </div>

                        <div className="stakes-divider">
                            <span className="divider-line" />
                            <span className="divider-arrow">→</span>
                            <span className="divider-line" />
                        </div>

                        <div className="stake-card outcome">
                            <div className="stake-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div className="stake-label">Outcome</div>
                            <p>{data.outcome}</p>
                        </div>
                    </div>
                </div>

                {/* METRICS */}
                {data.metrics.length > 0 && (
                    <div className="story-section metrics-section">
                        <div className="metrics-grid">
                            {data.metrics.map((metric, i) => (
                                <div
                                    key={i}
                                    className="metric-badge"
                                    data-value={metric}
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                >
                                    {metric}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STORY */}
                <div id="story" className="story-section story-content">
                    <div className="section-header">
                        <span className="section-number">02</span>
                        <span className="section-title">THE STORY</span>
                    </div>

                    <ReactMarkdown
                        components={{
                            h2: ({ children, ...props }) => (
                                <h2 className="story-h2" {...props}>
                                    <span className="h2-marker" />
                                    {children}
                                </h2>
                            ),
                            h3: ({ children, ...props }) => (
                                <h3 className="story-h3" {...props}>{children}</h3>
                            ),
                            p: ({ children, ...props }) => {
                                const text = children?.toString() || '';

                                // Handle inline images
                                const imageMatch = text.match(/!\[IMAGE-(\d+)\]/);
                                if (imageMatch) {
                                    const idx = parseInt(imageMatch[1]);
                                    const img = data.images[idx];
                                    if (!img) return null;

                                    const parts = img.split('#');
                                    const imagePath = parts[0].trim();
                                    const caption = parts[1]?.trim();

                                    return (
                                        <figure className="story-image">
                                            <div className="image-wrapper">
                                                <img src={imagePath} alt={caption || ''} />
                                                <div className="image-border" />
                                            </div>
                                            {caption && <figcaption>{caption}</figcaption>}
                                        </figure>
                                    );
                                }

                                return <p className="story-p" {...props}>{children}</p>;
                            },
                            blockquote: ({ children, ...props }) => (
                                <blockquote className="story-quote" {...props}>
                                    <span className="quote-mark">j</span>
                                    {children}
                                </blockquote>
                            ),
                            strong: ({ ...props }) => <strong className="story-emphasis" {...props} />,
                        }}
                    >
                        {data.story}
                    </ReactMarkdown>
                </div>

                {/* INSIGHT */}
                {data.insight && (
                    <div id="insight" className="story-section insight-section">
                        <div className="section-header">
                            <span className="section-number">03</span>
                            <span className="section-title">THE LESSON</span>
                        </div>
                        <p className="insight-text">{data.insight}</p>
                    </div>
                )}

                {/* FOOTER */}
                <div className="story-section footer-section">
                    <div className="footer-tags">
                        {data.tags.map(tag => (
                            <span key={tag} className="tag">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .achievement-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.98);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: fadeIn 0.3s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* READING INDICATOR */
                .reading-indicator {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    z-index: 1004;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .reading-indicator.active {
                    opacity: 1;
                }

                .reading-bar {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        transparent 0%,
                        rgba(255, 255, 255, 0.8) 50%,
                        transparent 100%
                    );
                    animation: scan 1.5s linear infinite;
                }

                @keyframes scan {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }

                /* PROGRESS SYSTEM */
                .progress-system {
                    position: fixed;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1003;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                }

                .progress-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.8);
                    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .section-dots {
                    display: flex;
                    gap: 24px;
                }

                .section-dot {
                    position: relative;
                    width: 8px;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .section-dot.active {
                    background: rgba(255, 255, 255, 0.8);
                    transform: scale(1.2);
                }

                .section-dot:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .section-label {
                    position: absolute;
                    bottom: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    font: 400 9px/1 'Rajdhani', monospace;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.3);
                    white-space: nowrap;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .section-dot:hover .section-label {
                    opacity: 1;
                }

                /* TIME INDICATOR */
                .time-indicator {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    font: 500 11px/1 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.6);
                    letter-spacing: 0.08em;
                    z-index: 1003;
                }

                .time-indicator svg {
                    opacity: 0.6;
                }

                /* CLOSE BUTTON */
                .close-btn {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    z-index: 1003;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }

                .close-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                }

                .close-btn:hover::before {
                    transform: translateX(0);
                }

                .close-btn:hover {
                    border-color: rgba(255, 255, 255, 0.8);
                }

                .close-icon {
                    position: relative;
                    width: 16px;
                    height: 16px;
                    margin: auto;
                }

                .close-icon span {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.8);
                    transition: transform 0.3s ease;
                }

                .close-icon span:first-child {
                    transform: translateY(-50%) rotate(45deg);
                }

                .close-icon span:last-child {
                    transform: translateY(-50%) rotate(-45deg);
                }

                .close-btn:hover .close-icon span {
                    background: #FFFFFF;
                }

                /* MODAL CONTAINER */
                .achievement-modal-container {
                    width: 85%;
                    max-width: 900px;
                    height: 85vh;
                    background: #000000;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow-y: auto;
                    overflow-x: hidden;
                    animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    scroll-behavior: smooth;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* HERO SECTION */
                .hero-section {
                    position: relative;
                    height: 70vh;
                    min-height: 500px;
                    display: flex;
                    align-items: flex-end;
                    overflow: hidden;
                }

                .hero-image {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    filter: grayscale(100%) contrast(1.2);
                    transform: scale(1.05);
                    animation: heroZoom 20s linear infinite alternate;
                }

                @keyframes heroZoom {
                    from { transform: scale(1.05); }
                    to { transform: scale(1.1); }
                }

                .hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom,
                        rgba(0,0,0,0.2) 0%,
                        rgba(0,0,0,0.7) 60%,
                        rgba(0,0,0,0.95) 100%
                    );
                }

                .hero-grid {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px);
                    background-size: 50px 50px;
                    animation: gridMove 10s linear infinite;
                }

                @keyframes gridMove {
                    from { transform: translate(0, 0); }
                    to { transform: translate(50px, 50px); }
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                    padding: 60px;
                    width: 100%;
                }

                .hero-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 24px;
                    opacity: 0;
                    animation: fadeInUp 0.6s 0.2s ease forwards;
                }

                .meta-item {
                    font: 400 11px/1 'Rajdhani', monospace;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.6);
                }

                .meta-divider {
                    color: rgba(255, 255, 255, 0.2);
                }

                .hero-title {
                    font: 700 clamp(42px, 6vw, 64px)/1 'Rajdhani', monospace;
                    color: #FFFFFF;
                    margin: 0 0 24px 0;
                    letter-spacing: -0.02em;
                    opacity: 0;
                    animation: fadeInUp 0.6s 0.3s ease forwards;
                }

                .title-word {
                    display: inline-block;
                    position: relative;
                }

                .title-word::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.3);
                    transition: width 0.5s ease;
                }

                .hero-section:hover .title-word::after {
                    width: 100%;
                }

                .hero-hook {
                    font: 400 clamp(18px, 2.5vw, 22px)/1.4 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 0;
                    max-width: 650px;
                    opacity: 0;
                    animation: fadeInUp 0.6s 0.4s ease forwards;
                }

                @keyframes fadeInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                }

                /* SECTION HEADERS */
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 40px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .section-number {
                    font: 700 32px/1 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.1);
                    letter-spacing: -0.02em;
                }

                .section-title {
                    font: 500 11px/1 'Rajdhani', monospace;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.4);
                }

                /* STAKES SECTION */
                .stakes-section {
                    padding: 80px 60px;
                    background: linear-gradient(to bottom,
                        rgba(255, 255, 255, 0.02) 0%,
                        transparent 100%
                    );
                }

                .stakes-container {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 40px;
                    align-items: center;
                }

                .stake-card {
                    padding: 32px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .stake-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 1px;
                    background: linear-gradient(90deg, 
                        transparent 0%,
                        rgba(255, 255, 255, 0.4) 50%,
                        transparent 100%
                    );
                    transition: left 0.5s ease;
                }

                .stake-card:hover::before {
                    left: 100%;
                }

                .stake-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    transform: translateY(-2px);
                }

                .stake-icon {
                    width: 32px;
                    height: 32px;
                    margin-bottom: 16px;
                    padding: 6px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stake-icon svg {
                    width: 100%;
                    height: 100%;
                    stroke: rgba(255, 255, 255, 0.4);
                }

                .stake-label {
                    font: 600 10px/1 'Rajdhani', monospace;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 16px;
                }

                .stake-card p {
                    font: 400 16px/1.6 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.8);
                    margin: 0;
                }

                .stakes-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .divider-line {
                    width: 20px;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                }

                .divider-arrow {
                    font-size: 20px;
                    color: rgba(255, 255, 255, 0.3);
                }

                /* METRICS */
                .metrics-section {
                    padding: 60px;
                    background: #000000;
                    position: relative;
                    overflow: hidden;
                }

                .metrics-section::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 200%;
                    height: 1px;
                    background: linear-gradient(90deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.05) 50%,
                        transparent 100%
                    );
                }

                .metrics-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    justify-content: center;
                    position: relative;
                }

                .metric-badge {
                    padding: 16px 24px;
                    background: #000000;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    position: relative;
                    overflow: hidden;
                    font: 600 14px/1 'Rajdhani', monospace;
                    letter-spacing: 0.08em;
                    color: rgba(255, 255, 255, 0.9);
                    text-transform: uppercase;
                    opacity: 0;
                    transform: translateY(20px);
                    animation: metricReveal 0.5s ease forwards;
                }

                @keyframes metricReveal {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .metric-badge::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.05) 50%,
                        transparent 100%
                    );
                    transform: translateX(-100%) translateY(-100%);
                    transition: transform 0.6s ease;
                }

                .metric-badge.in-view::before {
                    transform: translateX(100%) translateY(100%);
                }

                /* STORY CONTENT */
                .story-content {
                    max-width: 680px;
                    margin: 0 auto;
                    padding: 80px 60px;
                }

                .story-h2 {
                    font: 700 clamp(28px, 3.5vw, 34px)/1.2 'Rajdhani', monospace;
                    color: #FFFFFF;
                    margin: 60px 0 24px 0;
                    position: relative;
                    padding-left: 24px;
                }

                .h2-marker {
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 12px;
                    height: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    background: transparent;
                    transition: all 0.3s ease;
                }

                .story-h2:hover .h2-marker {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-50%) rotate(45deg);
                }

                .story-h3 {
                    font: 600 clamp(20px, 2.5vw, 24px)/1.3 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 40px 0 16px 0;
                    position: relative;
                    padding-left: 16px;
                }

                .story-h3::before {
                    content: '//';
                    position: absolute;
                    left: 0;
                    color: rgba(255, 255, 255, 0.2);
                }

                .story-p {
                    font: 400 17px/1.7 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.75);
                    margin: 20px 0;
                }

                .story-emphasis {
                    color: #FFFFFF;
                    font-weight: 600;
                    position: relative;
                }

                .story-emphasis::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.2);
                    transform: scaleX(0);
                    transition: transform 0.3s ease;
                }

                .story-emphasis:hover::after {
                    transform: scaleX(1);
                }

                /* Story images */
                .story-image {
                    margin: 50px -30px;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.6s ease;
                }

                .story-image.in-view {
                    opacity: 1;
                    transform: translateY(0);
                }

                .image-wrapper {
                    position: relative;
                    overflow: hidden;
                    background: #000000;
                }

                .story-image img {
                    width: 100%;
                    height: auto;
                    max-height: 400px;
                    object-fit: cover;
                    display: block;
                    filter: grayscale(50%) contrast(1.1);
                    transition: all 0.5s ease;
                }

                .story-image:hover img {
                    filter: grayscale(0%) contrast(1);
                    transform: scale(1.02);
                }

                .image-border {
                    position: absolute;
                    inset: 0;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    pointer-events: none;
                }

                .story-image figcaption {
                    padding: 12px 30px;
                    font: 400 12px/1.4 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    background: rgba(0, 0, 0, 0.5);
                }

                /* Pull quotes */
                .story-quote {
                    margin: 50px 0;
                    padding: 32px;
                    position: relative;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .quote-mark {
                    position: absolute;
                    top: -10px;
                    left: 20px;
                    font-size: 48px;
                    color: rgba(255, 255, 255, 0.1);
                    font-family: Georgia, serif;
                    background: #000000;
                    padding: 0 10px;
                }

                .story-quote p {
                    font: 500 20px/1.5 'Rajdhani', monospace;
                    font-style: italic;
                    color: rgba(255, 255, 255, 0.8);
                    margin: 0;
                    position: relative;
                }

                /* INSIGHT SECTION */
                .insight-section {
                    padding: 80px 60px;
                    background: transparent;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    text-align: center;
                    position: relative;
                }

                .insight-section::before {
                    content: '';
                    position: absolute;
                    top: -1px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80px;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.3);
                }

                .insight-text {
                    font: 500 clamp(22px, 3vw, 28px)/1.5 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 0 auto;
                    max-width: 600px;
                    position: relative;
                }

                /* FOOTER */
                .footer-section {
                    padding: 40px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    background: rgba(0, 0, 0, 0.5);
                }

                .footer-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    justify-content: center;
                }

                .tag {
                    padding: 6px 12px;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    font: 400 11px/1 'Rajdhani', monospace;
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 0.08em;
                    text-transform: lowercase;
                    transition: all 0.3s ease;
                }

                .tag:hover {
                    color: rgba(255, 255, 255, 0.8);
                    border-color: rgba(255, 255, 255, 0.3);
                }

                /* SCROLLBAR */
                .achievement-modal-container::-webkit-scrollbar {
                    width: 6px;
                }

                .achievement-modal-container::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                }

                .achievement-modal-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }

                .achievement-modal-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                /* Smooth reveal animations */
                .story-section {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .story-section.in-view {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* RESPONSIVE */
                @media (max-width: 768px) {
                    .achievement-modal-container {
                        width: 100%;
                        height: 100vh;
                    }

                    .progress-system {
                        display: none;
                    }

                    .time-indicator {
                        display: none;
                    }

                    .hero-content,
                    .stakes-section,
                    .story-content,
                    .insight-section {
                        padding: 40px 24px;
                    }

                    .stakes-container {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }

                    .stakes-divider {
                        transform: rotate(90deg);
                    }

                    .story-image {
                        margin: 30px -24px;
                    }

                    .section-header {
                        margin-bottom: 24px;
                    }
                }

                /* Performance optimizations */
                @media (prefers-reduced-motion: reduce) {
                    *,
                    *::before,
                    *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </div>
    )}