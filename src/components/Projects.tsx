'use client';

import React from 'react';

/* ---------- Local project data (kept inside this file) ---------- */
type ProjectItem = {
    id: string;
    title: string;
    year?: number;
    blurb: string;
    hero: string;     // path in /public
    tags?: string[];
};

const PROJECTS: ProjectItem[] = [
    {
        id: 'robocup-line',
        title: 'RoboCup – Rescue Line Robot',
        year: 2023,
        blurb:
            'Autonomous line-following with debris avoidance, ramp climbing and victim detection. Custom PCB, PID loops, field tuning under two minutes.',
        hero: '/images/projects/robocup-line.jpg',
        tags: ['robotics', 'embedded', 'pid'],
    },
    {
        id: 'robocup-sim',
        title: 'RoboCup – Rescue Simulation',
        year: 2023,
        blurb:
            'Urban disaster multi-agent strategy: A*, frontier allocation, triage priorities, and rollout evaluation to cut time-to-care.',
        hero: '/images/projects/robocup-sim.png',
        tags: ['planning', 'multi-agent', 'a*'],
    },
    {
        id: 'heat-pump',
        title: 'Industrial Heat Pump – Diagnostic Model',
        year: 2022,
        blurb:
            'Reverse-engineered a 20-ton unit; built a functional scale model to surface manufacturing faults and deliver a print-ready demo.',
        hero: '/images/projects/heat-pump.png',
        tags: ['mechanical', 'reverse-engineering', '3d-printing'],
    },
];

/* ------------------------------- Component ------------------------------- */
export default function Projects() {
    const sectionRef = React.useRef<HTMLElement | null>(null);
    const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);

    // simple reveal (kept lightweight and not interfering with hover transforms)
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

    return (
        <section ref={sectionRef} className="projects">
            {/* Left spine (section-scoped) */}
            <span aria-hidden className="spine" />

            {/* Title at the TOP, normal flow, forced 2 lines */}
            <div className="title-wrap">
                <h2 className="title">
                    <span className="line">The Projects That</span>
                    <span className="line">Won World Cups</span>
                </h2>
            </div>

            {/* Grid */}
            <div className="grid">
                {PROJECTS.map((p, i) => (
                    <article
                        key={p.id}
                        className="proj-card"
                        style={{ animationDelay: `${i * 90}ms` }}
                    >
                        {/* slim caption with [01] + year */}
                        <div className="caption">
                            <span className="index">[{String(i + 1).padStart(2, '0')}]</span>
                            <span className="dot" />
                            {typeof p.year === 'number' && <span className="year">{p.year}</span>}
                        </div>

                        <h3 className="p-title">{p.title}</h3>

                        {/* only the image is clickable */}
                        <button
                            type="button"
                            className="visual"
                            onClick={() => setLightboxSrc(p.hero)}
                            aria-label={`Open image of ${p.title}`}
                        >
                            <img src={p.hero} alt={p.title} />
                        </button>

                        <p className="blurb">{p.blurb}</p>

                        {p.tags && p.tags.length > 0 && (
                            <div className="tags">
                                {p.tags.map((t) => (
                                    <span key={t} className="tag">#{t}</span>
                                ))}
                            </div>
                        )}
                    </article>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxSrc && (
                <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxSrc(null)}>
                    <img className="lb-img" src={lightboxSrc} alt="Project" />
                    <button className="lb-close" aria-label="Close" onClick={() => setLightboxSrc(null)}>
                        <span />
                        <span />
                    </button>
                </div>
            )}

            <style jsx>{`
        /* Section container: transparent; page root provides background */
        .projects {
          padding: 64px 0 60px; /* top padding keeps title at the top comfortably */
          position: relative;
          background: transparent;
        }

        /* LEFT SPINE — exactly 100px from the left, only for this section */
        .spine {
          position: absolute;
          left: 100px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(255, 255, 255, 0.14);
          pointer-events: none;
        }

        /* Title area (top of section) */
        .title-wrap {
          max-width: 1600px;
          margin: 0 auto 12px;
          padding-left: calc(100px + 40px);   /* spine + inner gutter */
          padding-right: calc(100px + 40px);  /* 100px right margin + inner gutter */
        }
        .title {
          margin: 0;
          font: 700 clamp(40px, 6vw, 84px)/0.95 "Rajdhani", monospace; /* your font + tracking */
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.88);
        }
        .title .line { display: block; } /* force two lines */

        /* Grid (won't clip hover zoom) */
        .grid {
          max-width: 1600px;
          margin: 0 auto;
          padding-left: calc(100px + 40px);
          padding-right: calc(100px + 40px);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 22px;
          overflow: visible;       /* ⬅️ allow scaled cards to spill */
          position: relative;
          isolation: isolate;      /* ⬅️ make z-index predictable */
        }

        /* Card (WHOLE-CARD ZOOM ON HOVER) */
        .proj-card {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          transition:
            transform 140ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 140ms ease,
            border-color 120ms ease,
            background 120ms ease,
            opacity 250ms ease;
          opacity: 0;
          transform-origin: center;
          transform: translateZ(0) scale(1); /* GPU hint + baseline */
          will-change: transform, box-shadow;
          z-index: 0;
        }
        .proj-card.in-view { opacity: 1; }

        /* Real zoom: 1.08x (i.e., 600→648px visually) */
        .proj-card:hover,
        .proj-card:focus-within {
          transform: scale(1.04);                /* ⬅️ TRUE WHOLE-CARD ZOOM */
          box-shadow: 0 32px 88px rgba(0, 0, 0, 0.6);
          border-color: rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.05);
          z-index: 50;                            /* float above neighbors */
        }

        /* Soft glow ring */
        .proj-card::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 0 36px rgba(255,255,255,0.12);
          opacity: 0;
          transition: opacity 140ms ease;
        }
        .proj-card:hover::after,
        .proj-card:focus-within::after { opacity: 1; }

        /* Caption ([01] + year) */
        .caption {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px 6px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .index, .year {
          font: 600 11px/1 'Rajdhani', monospace;
          letter-spacing: 0.16em;
          color: rgba(255, 255, 255, 0.56);
          text-transform: uppercase;
        }
        .dot { width: 3px; height: 3px; border-radius: 999px; background: rgba(255,255,255,0.25); }

        .p-title {
          font: 800 clamp(18px, 2.6vw, 24px)/1.15 'Rajdhani', monospace;
          color: #fff;
          margin: 10px 14px 8px 14px;
          letter-spacing: .01em;
        }

        /* Image (no extra zoom; the card itself scales) */
        .visual {
          display: block; width: 100%; aspect-ratio: 16 / 9;
          border: none; padding: 0; background: #000; cursor: zoom-in;
        }
        .visual img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }

        .blurb {
          padding: 12px 14px 0;
          font: 400 16px/1.6 'Rajdhani', monospace;
          color: rgba(255, 255, 255, 0.84);
          margin: 0;
        }

        .tags {
          display: flex; flex-wrap: wrap; gap: 8px;
          padding: 10px 14px 14px;
        }
        .tag {
          padding: 6px 10px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.35);
          color: rgba(255, 255, 255, 0.74);
          font: 600 11px/1 'Rajdhani', monospace;
          letter-spacing: 0.08em;
          text-transform: lowercase;
          transition: border-color 120ms ease, color 120ms ease, transform 120ms ease;
        }
        .tag:hover {
          border-color: rgba(255, 255, 255, 0.34);
          color: rgba(255, 255, 255, 0.98);
          transform: translateY(-1px);
        }

        /* Lightbox */
        .lightbox { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.96); display: flex; align-items: center; justify-content: center; }
        .lb-img   { max-width: 92vw; max-height: 92vh; object-fit: contain; border: 1px solid rgba(255,255,255,0.15); }
        .lb-close { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; background: transparent; border: 1px solid rgba(255,255,255,0.3); cursor: pointer; }
        .lb-close span { position: absolute; left: 6px; right: 6px; top: 50%; height: 1px; background: #fff; }
        .lb-close span:first-child { transform: translateY(-50%) rotate(45deg); }
        .lb-close span:last-child  { transform: translateY(-50%) rotate(-45deg); }

        /* Responsive spine + paddings */
        @media (max-width: 1024px) {
          .spine { left: 60px; }
          .title-wrap, .grid {
            padding-left: calc(60px + 24px);
            padding-right: calc(60px + 24px);
          }
          .grid { grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); }
        }
        @media (max-width: 640px) {
          .spine { left: 40px; }
          .title-wrap, .grid {
            padding-left: calc(40px + 16px);
            padding-right: calc(40px + 16px);
          }
          .grid { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          .proj-card { transition: none !important; }
        }
      `}</style>
        </section>
    );
}
