'use client';
import { useEffect, useRef } from 'react';

export default function CursorGlow() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current!;
        const move = (e: MouseEvent) => {
            el.animate(
                { left: `${e.clientX}px`, top: `${e.clientY}px` },
                { duration: 300, fill: 'forwards', easing: 'ease-out' }
            );
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);
    return (
        <div
            ref={ref}
            className="pointer-events-none fixed z-[60] h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full
                 bg-[radial-gradient(closest-side,rgba(0,224,255,.25),rgba(0,224,255,0))]
                 mix-blend-screen"
        />
    );
}
