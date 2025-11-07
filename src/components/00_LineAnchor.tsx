'use client';

import { useEffect, useRef } from 'react';

interface LineAnchorProps {
    id: string;
    position?: 'left' | 'center' | 'right';
    offsetX?: number; // Offset from viewport edge (not container edge!)
    offsetY?: number;
}

export function LineAnchor({
                               id,
                               position = 'left',
                               offsetX = 0,
                               offsetY = 0
                           }: LineAnchorProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updatePosition = () => {
            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const scrollY = window.scrollY;

            // Calculate X position relative to VIEWPORT, not container
            let x: number;

            if (position === 'left') {
                // Left edge of viewport + offset
                x = offsetX;
            } else if (position === 'center') {
                // Center of viewport + offset
                x = window.innerWidth / 2 + offsetX;
            } else if (position === 'right') {
                // Right edge of viewport - offset
                x = window.innerWidth - offsetX;
            } else {
                x = offsetX;
            }

            // Y position is based on where the anchor element actually is
            const y = rect.top + scrollY + offsetY;

            // CRITICAL: Round to prevent subpixel rendering issues
            // Without this, 4px lines appear as 1-2px at certain decimal positions
            const roundedX = Math.round(x);
            const roundedY = Math.round(y);

            // Store in global registry
            if (typeof window !== 'undefined') {
                window.lineAnchors = window.lineAnchors || {};
                window.lineAnchors[id] = { x: roundedX, y: roundedY };

                // Trigger path recalculation
                window.dispatchEvent(new CustomEvent('anchors-updated'));
            }
        };

        // Initial position + updates
        const timer = setTimeout(updatePosition, 50);
        updatePosition();

        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
        };
    }, [id, position, offsetX, offsetY]);

    return (
        <div
            ref={ref}
            data-line-anchor={id}
            className="absolute pointer-events-none"
            style={{
                width: '1px',
                height: '1px',
                // Uncomment to debug anchor positions:
                // background: 'red',
                // width: '8px',
                // height: '8px',
                // borderRadius: '50%',
                // zIndex: 9999,
            }}
        />
    );
}

// TypeScript global declaration
declare global {
    interface Window {
        lineAnchors?: Record<string, { x: number; y: number }>;
    }
}