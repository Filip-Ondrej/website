'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
};

export default function MagneticButton({ children, className = '', ...rest }: Props) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 300, damping: 25 });
    const sy = useSpring(y, { stiffness: 300, damping: 25 });

    return (
        <motion.button
            ref={ref}
            onMouseMove={(e) => {
                const r = ref.current!.getBoundingClientRect();
                x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
                y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
            }}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ translateX: sx, translateY: sy }}
            whileTap={{ scale: 0.96 }}
            className={`rounded-2xl px-6 py-3 font-semibold shadow-soft ${className}`}
            {...rest}
        >
            {children}
        </motion.button>
    );
}
