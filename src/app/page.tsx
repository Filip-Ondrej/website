'use client';
import { motion } from 'framer-motion';
import Link from "next/link"; // add this

export default function Home() {
    return (
        <section className="py-24 sm:py-32">
            <div className="grid gap-8 md:grid-cols-2 items-center">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
                        Building autonomous<br />3D-printing systems.
                    </h1>
                    <p className="mt-5 text-zinc-300">
                        Mechatronics @ TUHH & founder of UNARCHI. Robotics, large-scale 3D printing, control systems, prototypes.
                    </p>
                    <div className="mt-8 flex gap-3">
                        <Link href="/projects" className="rounded-2xl px-5 py-3 bg-white text-black hover:opacity-90">View projects</Link>
                        <Link href="/contact" className="rounded-2xl px-5 py-3 border border-white/20 hover:border-white/40">Contact</Link>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="aspect-video rounded-2xl bg-white/5 ring-1 ring-white/10 grid place-items-center text-zinc-400">
                    {/* Replace with your embed or <video> later */}
                    Promo video placeholder
                </motion.div>
            </div>
        </section>
    );
}
