'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MagneticButton from '@/components/MagneticButton';
import TiltCard from '@/components/TiltCard';
import CursorGlow from '@/components/CursorGlow';
import Collaborations from '@/components/Collaborations';

function GradientField() {
    // animated conic + radial mask – cheap and striking
    return (
        <div
            aria-hidden
            className="absolute inset-0 -z-10 [mask-image:radial-gradient(70%_70%_at_50%_40%,black,transparent)]
                 bg-[conic-gradient(from_0deg,rgba(255,106,0,.12),rgba(0,224,255,.12),rgba(255,106,0,.12))] animate-[spin_16s_linear_infinite]"
        />
    );
}

export default function Home() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <CursorGlow />
            <section className="relative overflow-hidden rounded-2xl ring-1 ring-white/10 mt-8">
                <GradientField />

                <div className="relative px-6 py-20 md:py-28">
                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="font-bank text-5xl sm:text-7xl tracking-[0.02em] text-white text-outline"
                    >
                        I build autonomous<br/>3D-printing systems.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="mt-4 max-w-2xl text-zinc-300"
                    >
                        Robotics • Control • Real-time calibration • Large-scale additive manufacturing.
                    </motion.p>

                    <div className="mt-8 flex gap-3">
                        <Link href="/projects" className="rounded-2xl px-6 py-3 bg-white text-black hover:opacity-90 transition">
                            View projects
                        </Link>
                        <MagneticButton
                            onClick={() => setOpen(true)}
                            className="border border-white/20 hover:border-white/40 bg-white/5 text-white"
                        >
                            Watch 45-sec reel
                        </MagneticButton>
                    </div>

                    {/* marquee receipts */}
                    <div className="mt-10 overflow-hidden">
                        <div className="flex gap-8 animate-[marquee_18s_linear_infinite] whitespace-nowrap opacity-80 text-sm">
                            <span>World Champion — RoboCup Rescue Simulation</span>
                            <span>Best Hardware — RoboCup Rescue Line (EU & World)</span>
                            <span>St. Gorazd Award — Highest moral award (SVK)</span>
                            <span>Young Creator — Ministry of Education</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tilted project teaser */}
            <section className="py-14">
                <div className="flex items-end justify-between">
                    <h2 className="font-bank text-3xl">Projects</h2>
                    <Link href="/projects" className="underline opacity-80 hover:opacity-100">All projects →</Link>
                </div>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <TiltCard title="Autonomous 2×2 m Printer Module" subtitle="Real-time calibration, multi-nozzle head" />
                    <TiltCard title="Hush Guard — Noise Monitoring" subtitle="IoT beacons + dashboard; hardware + SaaS" />
                </div>
            </section>

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
            <main>
                {/* ...your hero / content above... */}
                <Collaborations />
            </main>
            );
        </>
    );
}

/* Tailwind keyframes (v4 supports @keyframes in globals; see step 3) */
