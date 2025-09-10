'use client';

import { useRef, type MouseEvent } from 'react';
import {
    motion,
    useMotionValue,
    useSpring,
    type MotionValue,
} from 'framer-motion';

// Use Framer Motion's button prop types so spreading props stays type-safe
type MotionButtonProps = React.ComponentProps<typeof motion.button>;

export default function MagneticButton({
                                           children,
                                           className = '',
                                           ...rest
                                       }: MotionButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);

    // motion values + springs
    const x: MotionValue<number> = useMotionValue(0);
    const y: MotionValue<number> = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 300, damping: 25 });
    const sy = useSpring(y, { stiffness: 300, damping: 25 });

    const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
        const r = ref.current!.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        x.set(dx * 0.25);
        y.set(dy * 0.25);
    };

    const handleLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            whileTap={{ scale: 0.96 }}
            // style accepts MotionValue<number> just fine
            style={{ translateX: sx, translateY: sy }}
            className={`rounded-2xl px-6 py-3 font-semibold shadow-soft ${className}`}
            {...rest}
        >
            {children}
        </motion.button>
    );
}
