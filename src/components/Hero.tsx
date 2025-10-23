'use client';

import React from 'react';

type HeroProps = {
    imageSrc?: string; // /public path to your portrait
    kicker?: string;
};

function clamp(n: number, min = 0, max = 1) { return Math.min(max, Math.max(min, n)); }
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export default function Hero({
                                 imageSrc = '/images/me.jpg',
                                 kicker,
                             }: HeroProps) {
    const sectionRef = React.useRef<HTMLElement | null>(null);
    const visualRef = React.useRef<HTMLDivElement | null>(null);
    const imgRef = React.useRef<HTMLDivElement | null>(null);
    const maskRef = React.useRef<HTMLDivElement | null>(null);
    const titleWrapRef = React.useRef<HTMLDivElement | null>(null);

    // inertial scroll state
    const targetRef = React.useRef(0);
    const currentRef = React.useRef(0);
    const rafRef = React.useRef<number | null>(null);
    const reducedMotion = React.useRef<boolean>(false);

    // mouse tilt
    const mouseX = React.useRef(0);
    const mouseY = React.useRef(0);

    React.useEffect(() => {
        reducedMotion.current = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        const onScroll = () => {
            const root = sectionRef.current;
            if (!root) return;

            const rect = root.getBoundingClientRect();
            const vh = window.innerHeight || 1;

            // progress = 0 when section enters; 1 when ~90% past viewport
            const raw = 1 - (rect.bottom - 0.1 * vh) / (rect.height + 0.1 * vh);
            targetRef.current = clamp(raw);
            if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
        };

        const onResize = onScroll;

        function tick() {
            rafRef.current = null;
            const next = lerp(currentRef.current, targetRef.current, 0.16);
            currentRef.current = next;
            applyVisuals(next);
            if (Math.abs(next - targetRef.current) > 0.0015) {
                rafRef.current = requestAnimationFrame(tick);
            }
        }

        function applyVisuals(progressRaw: number) {
            const p = easeOutCubic(clamp(progressRaw));

            // image transforms
            const scale = 1.18 - 0.10 * p;      // 1.18 → 1.08
            const ty = -60 * p;                 // up
            const rx = 6 - 6 * p;               // flatten
            const contrast = 1.08 - 0.08 * p;
            const blur = 3 * p;
            const brightness = 1 - 0.08 * p;

            // mouse tilt
            let tiltX = 0, tiltY = 0;
            if (!reducedMotion.current) {
                tiltX = (mouseY.current - 0.5) * 4;
                tiltY = (mouseX.current - 0.5) * -4;
            }

            if (visualRef.current) {
                visualRef.current.style.perspective = '1200px';
            }
            if (imgRef.current) {
                imgRef.current.style.transform =
                    `translate3d(0, ${ty}px, 0) rotateX(${rx + tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
                imgRef.current.style.filter =
                    `blur(${blur}px) brightness(${brightness}) contrast(${contrast})`;
            }

            // mask reveal
            if (maskRef.current) {
                const maskOpen = 55 + 45 * p; // 55% → 100%
                maskRef.current.style.maskImage =
                    `linear-gradient(to bottom, rgba(0,0,0,1) ${maskOpen}%, rgba(0,0,0,0) 100%)`;
                (maskRef.current.style as CSSStyleDeclaration & { WebkitMaskImage?: string }).WebkitMaskImage =
                    `linear-gradient(to bottom, rgba(0,0,0,1) ${maskOpen}%, rgba(0,0,0,0) 100%)`;
                maskRef.current.style.opacity = String(0.85 + 0.15 * p);
            }

            // title parallax lift
            if (titleWrapRef.current) {
                const tyTitle = 14 - 14 * p;
                titleWrapRef.current.style.transform = `translate3d(0, ${tyTitle}px, 0)`;
            }
        }

        // mouse tilt
        const onMouseMove = (e: MouseEvent) => {
            if (reducedMotion.current) return;
            const vw = window.innerWidth || 1;
            const vh = window.innerHeight || 1;
            mouseX.current = clamp(e.clientX / vw);
            mouseY.current = clamp(e.clientY / vh);
            if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <section ref={sectionRef} className="hero">
            {/* VISUAL */}
            <div className="visual" ref={visualRef}>
                <div ref={imgRef} className="img" style={{ backgroundImage: `url(${imageSrc})` }} />
                <div className="grain" />
                <div className="shine" />
                <div ref={maskRef} className="reveal-mask" />
                <div className="vignette" />
                <div className="frame" />
            </div>

            {/* COPY */}
            <div className="copy" ref={titleWrapRef}>
                {kicker && <div className="kicker">{kicker}</div>}
                <h1 className="title">
          <span className="line" style={{ animationDelay: '0ms' }}>
            I Turn ‘Impossible’ Into ‘Done’
          </span>
                </h1>
                <p className="sub">
                    Filip Ondrej — 10 years competing at World Cups. Now building companies that scale.
                </p>
            </div>

            <style jsx>{`
        .hero {
          position: relative;
          min-height: 96vh;
          display: grid;
          grid-template-columns: 1fr;
          align-items: end;
          background: transparent;
          overflow: clip;
        }

        /* Visual stack */
        .visual { position: absolute; inset: 0; overflow: hidden; }
        .img {
          position: absolute;
          inset: -8%;
          background-size: cover;
          background-position: center;
          transform: translate3d(0,0,0) rotateX(6deg) scale(1.18);
          filter: brightness(1) contrast(1);
          will-change: transform, filter;
        }
        .grain {
          position: absolute;
          inset: -12%;
          //background-image: url('/textures/noise.png'); /* fixed path */
          background-size: 280px 280px;
          opacity: 0.18;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .shine {
          position: absolute; inset: 0;
          background: linear-gradient(120deg, rgba(255,255,255,0.0) 35%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.0) 65%);
          transform: translateX(-40%);
          animation: shineSweep 1.6s cubic-bezier(.2,1,.22,1) 0.45s both;
          pointer-events: none;
        }
        @keyframes shineSweep {
          from { transform: translateX(-60%); opacity: 0; }
          25%  { opacity: 1; }
          to   { transform: translateX(40%); opacity: 0; }
        }

        /* mask opening as you scroll */
        .reveal-mask {
          position: absolute; inset: 0;
          opacity: 0.9;
          pointer-events: none;
          /* maskImage set from JS (also -webkit-mask) */
          background: rgba(0,0,0,0);
        }

        .vignette {
          position: absolute; inset: 0;
          background: radial-gradient(85% 85% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.42) 70%, rgba(0,0,0,0.76) 100%);
          pointer-events: none;
        }
        .frame {
          position: absolute; inset: 18px;
          border: 1px solid rgba(255,255,255,0.14);
          pointer-events: none;
        }

        /* Copy (keeps the left 100px alignment cue; no right line is rendered) */
        .copy {
          position: relative; z-index: 2;
          padding: 18vh calc(100px + 40px) 8vh calc(100px + 40px);
          max-width: 1600px;
          margin: 0 auto;
          will-change: transform;
        }

        .kicker {
          font: 600 11px/1 'Rajdhani', monospace;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          margin-bottom: 12px;
        }

        .title {
          margin: 0 0 10px 0;
          font-family: 'Rajdhani', monospace;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          line-height: 0.95;
          color: rgba(255,255,255,0.96);
          font-weight: 800;
          font-size: clamp(44px, 8.6vw, 124px);
        }
        .title .line {
          display: block;
          opacity: 0;
          transform: translateY(26px);
          animation: slideUp .74s cubic-bezier(.2,1,.22,1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(26px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sub {
          max-width: 720px;
          margin: 14px 0 0 0;
          font: 400 clamp(16px, 2vw, 20px)/1.6 'Rajdhani', monospace;
          color: rgba(255,255,255,0.78);
        }

        /* Left spine only (right side has none) */
        :global(.hero-spine) {
          position: absolute;
          left: 100px; top: 0; bottom: 0; width: 1px;
          background: rgba(255,255,255,0.14); pointer-events: none;
        }

        @media (max-width: 1024px) {
          .copy { padding: 16vh calc(60px + 24px) 8vh calc(60px + 24px); }
          .frame { inset: 14px; }
        }
        @media (max-width: 640px) {
          .copy { padding: 14vh calc(40px + 16px) 8vh calc(40px + 16px); }
          .frame { inset: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .img { transform: none !important; filter: none !important; }
          .shine { display: none !important; }
          .title .line { animation: none !important; opacity: 1; transform: none; }
        }
      `}</style>

            {/* Left alignment cue only (no right line rendered) */}
            <span className="hero-spine" aria-hidden />
        </section>
    );
}
