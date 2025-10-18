'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, {useEffect, useRef, useState} from 'react';
import {collaborators, type Collaborator} from '@/data/collaborators';
import '@/styles/collaborations.css';

/********************************************************************
 * --------------------- COLLABORATION BRANDS --------------------- *
 ********************************************************************/

export default function Collaborations() {
    const railRef = useRef<HTMLDivElement | null>(null);
    const rowRef = useRef<HTMLUListElement | null>(null);
    const [cloneCount, setCloneCount] = useState(5); // recomputed on mount/resize

    useEffect(() => {
        const rail = railRef.current;
        const row = rowRef.current;
        if (!rail || !row) return;

        let W = 0;                     // width of one row
        let offset = 0;                // current position (px)
        let velocity = 0;              // px/s, controlled by wheel + inertia
        let raf: number | null = null;
        let last = performance.now();
        let paused = false;            // pause only the DRIFT on hover

        /* ---------- knobs ---------- */
        const DRIFT = 40;              // px/s default autoplay (reduce if you like)
        const WHEEL_GAIN = 1.2;        // how strongly a wheel event kicks velocity
        const DAMPING = 0.9;           // 0.85–0.96; higher = longer coast
        const MIN_VEL = 2;             // px/s threshold to stop coast
        const MAX_VEL = 600;           // safety cap
        /* --------------------------- */

        const compute = () => {
            W = row.scrollWidth;
            rail.style.height = `${row.getBoundingClientRect().height}px`;

            // how many clones do we need? (viewport / row width) + buffer
            const vw = rail.clientWidth;
            setCloneCount(Math.max(3, Math.ceil(vw / (W || 1)) + 2));
        };

        // resize & content load re-measure
        const ro = new ResizeObserver(compute);
        ro.observe(row);

        // wrap to [0, W)
        const wrap = (px: number) => (!W ? px : ((px % W) + W) % W);

        const tick = (now: number) => {
            const dt = Math.max(0.001, (now - last) / 1000);   // seconds, clamp tiny
            last = now;

            // base drift (autoplay) only when not paused
            if (!paused) offset += DRIFT * dt;

            // integrate velocity (coast), frame-rate independent damping
            offset += velocity * dt;
            const dampingPerSecond = Math.pow(DAMPING, dt * 60);
            velocity *= dampingPerSecond;
            if (Math.abs(velocity) < MIN_VEL) velocity = 0;

            // apply wrapped transform to all rows
            if (W > 0) {
                const rows = rail.querySelectorAll<HTMLElement>('.brands-row');
                const total = rows.length;
                const o = wrap(offset);
                for (let i = 0; i < total; i++) {
                    const baseX = (i - Math.floor(total / 2)) * W;
                    rows[i].style.transform = `translate3d(${baseX - o}px,0,0)`;
                }
            }
            raf = requestAnimationFrame(tick);
        };

        const onWheel = (e: WheelEvent) => {
            if (!rail.matches(':hover')) return;
            e.preventDefault();

            // prefer vertical deltas; fallback to horizontal
            const raw = e.deltaY !== 0 ? e.deltaY : e.deltaX;

            // tame extreme deltas from high-res wheels/trackpads
            const clamped = Math.max(-120, Math.min(120, raw));

            // add to velocity; sign so that wheel-down moves content left
            velocity += clamped * WHEEL_GAIN;
            // cap velocity so it never goes out of hand
            velocity = Math.max(-MAX_VEL, Math.min(MAX_VEL, velocity));
        };

        const onEnter = () => {
            paused = true;
        };
        const onLeave = () => {
            paused = false;
        };
        const onFocusIn = () => {
            paused = true;
        };
        const onFocusOut = (ev: FocusEvent) => {
            if (!rail.contains(ev.relatedTarget as Node)) paused = false;
        };

        compute();
        raf = requestAnimationFrame(tick);

        rail.addEventListener('wheel', onWheel, {passive: false});
        rail.addEventListener('mouseenter', onEnter);
        rail.addEventListener('mouseleave', onLeave);
        rail.addEventListener('focusin', onFocusIn);
        rail.addEventListener('focusout', onFocusOut);
        window.addEventListener('resize', compute);

        return () => {
            if (raf) cancelAnimationFrame(raf);
            ro.disconnect();
            rail.removeEventListener('wheel', onWheel as EventListener);
            rail.removeEventListener('mouseenter', onEnter);
            rail.removeEventListener('mouseleave', onLeave);
            rail.removeEventListener('focusin', onFocusIn);
            rail.removeEventListener('focusout', onFocusOut);
            window.removeEventListener('resize', compute);
        };
    }, []);

    return (
        <section aria-labelledby="collab-title" className="mt-12">
            <Tape label="COLLABORATIONS & COMPANY EXPERIENCE" reverse={false}/>

            <div className="relative ">
                <h2 id="collab-title" className="sr-only">
                    Collaborations & Company Experience
                </h2>

                <div className="brands overflow-hidden select-none">
                    <div className="brands-rail" ref={railRef}>
                        {/* Base row used for measuring and rendering */}
                        <ul ref={rowRef} className="brands-row">
                            {collaborators.map((c, idx) => (
                                <BrandTile key={`base-${c.name}-${idx}`} c={c}/>
                            ))}
                        </ul>

                        {/* Clones — render exactly what compute() decided */}
                        {Array.from({length: cloneCount}).map((_, i) => (
                            <ul key={`clone-${i}`} className="brands-row" aria-hidden="true">
                                {collaborators.map((c, idx) => (
                                    <BrandTile key={`clone-${i}-${c.name}-${idx}`} c={c}/>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>
            </div>

            <Tape label="COLLABORATIONS & COMPANY EXPERIENCE" reverse/>
        </section>
    );
}


/********************************************************************
 * -------------------------- BRANDS ROW -------------------------- *
 ********************************************************************/

function BrandTile({c}: { c: Collaborator }) {
    // We allow missing logos and fallback to the brand name
    const content = c.logo ? (
        <Image
            src={c.logo}
            alt={c.name}
            fill
            sizes="(max-width: 768px) 40vw, (max-width: 1200px) 25vw, 15vw"
            className="object-contain"
            priority={false}
        />
    ) : (
        <span className="brand-name">{c.name}</span>
    );

    // Wrapper that fills the tile (same layout whether Link or div)
    const Inner = ({children}: { children: React.ReactNode }) => (
        <div className="brand-link relative w-full h-full grid place-items-center">
            {children}
            {/* hover chrome */}
            <span className="brand-card" aria-hidden="true">
            <span className="brand-corner" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" stroke="white"
                     fill="none" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 5 v14"/>
                    <path d="M4 5 h3"/>
                    <path d="M4 19 h3"/>

                    <path d="M20 5 v14"/>
                    <path d="M20 5 h-3"/>
                    <path d="M20 19 h-3"/>

                    <path d="M9 15 L15 9"/>
                    <path d="M15 9 h-4"/>
                    <path d="M15 9 v4"/>
                </svg>
            </span>
        <span className="brand-caption">[{c.caption ?? 'BRAND'}]</span>
      </span>
        </div>
    );

    return (
        <li className="brand">
            {c.href ? (
                <Link
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={c.name}
                    className="contents"
                >
                    <Inner>{content}</Inner>
                </Link>
            ) : (
                <Inner>{content}</Inner>
            )}
        </li>
    );
}


/********************************************************************
 * -------------------- TAPE with flicker code -------------------- *
 ********************************************************************/

function Tape({
                  label,
                  code = 'NRG1-SNP-TT',
                  reverse = false,
              }: {
    label: string;
    code?: string;
    reverse?: boolean;
}) {
    const railRef = useRef<HTMLDivElement | null>(null);
    const rowRef = useRef<HTMLDivElement | null>(null);
    const [cloneCount, setCloneCount] = useState(5);

    // ====== MATRIX FLICKER for the code word (unchanged logic) ======
    const codeUp = code.toUpperCase();
    const len = codeUp.length;
    const [current, setCurrent] = useState(codeUp);
    const [mode, setMode] = useState<'word' | 'digit'>('word');

    useEffect(() => {
        const prefersReduced =
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        if (prefersReduced) return;

        let flickerId: number | null = null;
        let settleId: number | null = null;

        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;
        const randMs = (a: number, b: number) => randInt(a * 1000, b * 1000);
        const rand01 = () => (Math.random() < 0.5 ? '0' : '1');

        const WAIT_MIN_S = 4, WAIT_MAX_S = 8;
        const FLICKER_MIN_S = 0.5, FLICKER_MAX_S = 1.5;
        const FLICKER_INTERVAL_MS = 10;

        const startCycle = () => {
            setMode('digit');
            const doFlick = () => {
                let s = '';
                for (let i = 0; i < len; i++) s += rand01();
                setCurrent(s);
            };
            doFlick();
            flickerId = window.setInterval(doFlick, FLICKER_INTERVAL_MS);

            settleId = window.setTimeout(() => {
                if (flickerId) clearInterval(flickerId);
                setCurrent(codeUp);
                setMode('word');
                settleId = window.setTimeout(startCycle, randMs(WAIT_MIN_S, WAIT_MAX_S));
            }, randMs(FLICKER_MIN_S, FLICKER_MAX_S));
        };

        settleId = window.setTimeout(
            startCycle,
            randMs(WAIT_MIN_S, WAIT_MAX_S)
        );

        return () => {
            if (flickerId) clearInterval(flickerId);
            if (settleId) clearTimeout(settleId);
        };
    }, [codeUp, len]);

    // ====== INFINITE DRIFT (no keyframes, no glitch) ======
    useEffect(() => {
        const rail = railRef.current;
        const row = rowRef.current;
        if (!rail || !row) return;

        const prefersReduced =
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

        let W = 0;               // width of a single tape row
        let offset = 0;          // px
        let raf: number | null = null;
        let last = performance.now();
        let paused = false;

        // knobs
        const DRIFT = 15;        // px/sec (tape speed)
        const dir = reverse ? -1 : 1;

        const compute = () => {
            W = row.scrollWidth;

            // height from content
            const h = row.getBoundingClientRect().height;
            rail.style.height = `${h}px`;

            // number of extra clones to cover viewport
            const vw = rail.clientWidth;
            setCloneCount(Math.max(3, Math.ceil(vw / (W || 1)) + 2));
        };

        const ro = new ResizeObserver(() => compute());
        ro.observe(row);

        const wrap = (px: number) => (!W ? px : ((px % W) + W) % W);

        const tick = (now: number) => {
            const dt = Math.max(0.001, (now - last) / 1000);
            last = now;

            if (!prefersReduced && !paused) {
                offset += dir * DRIFT * dt;
            }

            if (W > 0) {
                const rows = rail.querySelectorAll<HTMLElement>('.tape-row');
                const total = rows.length;
                const o = wrap(offset);
                for (let i = 0; i < total; i++) {
                    const baseX = (i - Math.floor(total / 2)) * W;
                    rows[i].style.transform = `translate3d(${baseX - o}px,0,0)`;
                }
            }
            raf = requestAnimationFrame(tick);
        };

        const onEnter = () => {
            paused = true;
        };
        const onLeave = () => {
            paused = false;
        };

        compute();
        raf = requestAnimationFrame(tick);

        rail.addEventListener('mouseenter', onEnter);
        rail.addEventListener('mouseleave', onLeave);
        window.addEventListener('resize', compute);

        return () => {
            if (raf) cancelAnimationFrame(raf);
            ro.disconnect();
            rail.removeEventListener('mouseenter', onEnter);
            rail.removeEventListener('mouseleave', onLeave);
            window.removeEventListener('resize', compute);
        };
    }, [reverse]);

    // ====== one block inside the tape ======
    const Slashes = () => (
        <span className="tape-chunk" aria-hidden="true">
      {'/////////////////////////'}
    </span>
    );

    const Block = (i: number) => (
        <div className="tape-block" key={i}>
            <Slashes/>
            <span className="tape-code tape-codeword" aria-hidden="true">
        {current.split('').map((ch, idx) => (
            <span
                className="tape-slot"
                data-mode={mode === 'digit' ? 'digit' : 'word'}
                key={idx}
            >
            {ch}
          </span>
        ))}
      </span>
            <Slashes/>
            <span className="tape-label">{label}</span>
        </div>
    );

    const BLOCKS_PER_ROW = 8;
    const blocks = Array.from({length: BLOCKS_PER_ROW}, (_, i) => Block(i));

    return (
        <div className="tape">
            <div className="tape-rail" ref={railRef}>
                {/* base row used for measurement and rendering */}
                <div className="tape-row" ref={rowRef}>
                    {blocks}
                </div>
                {/* clones — number computed in effect */}
                {Array.from({length: cloneCount}).map((_, i) => (
                    <div className="tape-row" aria-hidden="true" key={`clone-${i}`}>
                        {blocks}
                    </div>
                ))}
            </div>
        </div>
    );
}