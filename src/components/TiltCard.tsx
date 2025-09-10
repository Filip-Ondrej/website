'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useTransform, MotionValue } from 'framer-motion';

export default function TiltCard({
                                     title,
                                     subtitle,
                                 }: {
    title: string;
    subtitle: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0.5);
    const my = useMotionValue(0.5);

    // Map cursor position to rotation (typed MotionValues)
    const rotX: MotionValue<number> = useTransform(my, [0, 1], [8, -8]);
    const rotY: MotionValue<number> = useTransform(mx, [0, 1], [-8, 8]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={(e) => {
                const r = ref.current!.getBoundingClientRect();
                mx.set((e.clientX - r.left) / r.width);
                my.set((e.clientY - r.top) / r.height);
            }}
            onMouseLeave={() => {
                mx.set(0.5);
                my.set(0.5);
            }}
            style={{
                rotateX: rotX,
                rotateY: rotY,
                // Use the literal type instead of `any`
                transformStyle: 'preserve-3d',
            }}
            className="rounded-2xl border border-white/15 p-6 bg-white/5 backdrop-blur will-change-transform"
        >
            <div style={{ transform: 'translateZ(30px)' }}>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="opacity-75">{subtitle}</p>
            </div>
        </motion.div>
    );
}
