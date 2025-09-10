'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

/** --------- tiny particle background (GPU-cheap) ---------- */
function ParticleField() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const c = ref.current!;
        const ctx = c.getContext('2d')!;
        let w = 0, h = 0, raf = 0;

        const dots = Array.from({ length: 70 }, () => ({
            x: Math.random(),
            y: Math.random(),
            vx: (Math.random() * 0.25 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
            vy: (Math.random() * 0.25 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
        }));

        const resize = () => {
            w = c.width = c.offsetWidth * devicePixelRatio;
            h = c.height = c.offsetHeight * devicePixelRatio;
            ctx.scale(devicePixelRatio, devicePixelRatio);
        };

        const tick = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            const cw = w / devicePixelRatio;
            const ch = h / devicePixelRatio;

            dots.forEach(d => {
                d.x += d.vx * 0.0015;
                d.y += d.vy * 0.0015;
                if (d.x < 0) d.x = 1;
                if (d.x > 1) d.x = 0;
                if (d.y < 0) d.y = 1;
                if (d.y > 1) d.y = 0;

                const px = d.x * cw;
                const py = d.y * ch;
                ctx.beginPath();
                ctx.arc(px, py, 1.3, 0, Math.PI * 2);
                ctx.fill();
            });

            raf = requestAnimationFrame(tick);
        };

        resize();
        tick();
        const ro = new ResizeObserver(resize);
        ro.observe(c);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, []);

    return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-25" aria-hidden />;
}

/** -------------------------- HERO -------------------------- */
function Hero({ onOpenReel }: { onOpenReel: () => void }) {
    return (
        <section className="relative overflow-hidden rounded-2xl ring-1 ring-white/10 mt-8">
            <ParticleField />
            <div className="relative px-6 py-20 md:py-28">
                <motion.h1
                    initial={{ clipPath: 'inset(0 100% 0 0)' }}
                    animate={{ clipPath: 'inset(0 0% 0 0)' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="font-bank text-5xl sm:text-7xl tracking-tight"
                >
                    Building autonomous 3D-printing systems.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mt-4 max-w-2xl text-zinc-300"
                >
                    Robotics • Control • Real-time calibration • Large-scale additive manufacturing.
                </motion.p>

                <div className="mt-8 flex gap-3">
                    <Link
                        href="/projects"
                        className="rounded-2xl px-5 py-3 bg-white text-black hover:opacity-90 transition"
                    >
                        View projects
                    </Link>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                        onClick={onOpenReel}
                        className="rounded-2xl px-5 py-3 border border-white/20 hover:border-white/40"
                    >
                        Watch 45-sec reel
                    </motion.button>
                </div>
            </div>
        </section>
    );
}

/** --------------------- CREDIBILITY STRIP ------------------ */
function CredStrip() {
    const items = [
        { k: 'World Champion', v: 'RoboCup Rescue Simulation' },
        { k: 'Best Hardware', v: 'RoboCup Rescue Line (EU & World)' },
        { k: 'St. Gorazd Award', v: 'Highest moral award (SVK)' },
        { k: 'Young Creator', v: 'Ministry of Education' },
    ];
    return (
        <section className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map(i => (
                <div key={i.k} className="rounded-2xl border border-white/10 px-5 py-4">
                    <div className="text-sm opacity-70">{i.k}</div>
                    <div className="font-semibold">{i.v}</div>
                </div>
            ))}
        </section>
    );
}

/** --------------------------- PAGE ------------------------- */
export default function Home() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Hero onOpenReel={() => setOpen(true)} />
            <CredStrip />

            {/* Reel modal */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="w-full max-w-4xl aspect-video bg-black"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/_T8Ft80lDcY?autoplay=1&rel=0&modestbranding=1"
                                title="Filip Ondrej Reel"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
