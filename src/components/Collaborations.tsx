'use client';

import Link from 'next/link';
import { collaborators } from '@/data/collaborators';

/**
 * A tasteful “tape” band:
 * - Top & bottom animated border tapes with repeating text & marks
 * - Center area shows collaborator names (or swap to logos later)
 * - Prefers-reduced-motion handled
 */
export default function Collaborations() {
    return (
        <section aria-labelledby="collab-title" className="mt-16">
            {/* TOP TAPE */}
            <Tape
                label="COLLABORATIONS & BRAND EXPERIENCE"
                variant="top"
            />

            {/* CONTENT */}
            <div className="bg-[#0C0C0F]">
                <div className="container py-14">
                    <h2 id="collab-title" className="sr-only">
                        Collaborations & Brand Experience
                    </h2>
                    <ul className="grid gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                        {collaborators.map((c) => (
                            <li key={c.name} className="min-h-[64px] flex items-center">
                                {c.href ? (
                                    <Link
                                        href={c.href}
                                        className="text-[clamp(20px,2.4vw,28px)] font-semibold tracking-wide hover:opacity-90 focus:outline-none focus-visible:ring-2 rounded"
                                    >
                                        {c.name}
                                    </Link>
                                ) : (
                                    <span className="text-[clamp(20px,2.4vw,28px)] font-semibold tracking-wide">
                    {c.name}
                  </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* BOTTOM TAPE */}
            <Tape
                label="COLLABORATIONS & BRAND EXPERIENCE"
                variant="bottom"
            />
        </section>
    );
}

/** Decorative moving tape with repeating label + marks + binary clusters */
function Tape({ label, variant }: { label: string; variant: 'top' | 'bottom' }) {
    const content = Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6">
      <span className="tracking-[0.18em] text-xs sm:text-[13px]">
        {label}
      </span>
            <span aria-hidden className="opacity-60">/ / / / / / / / / / / / / /</span>
            <span aria-hidden className="opacity-60">{binaryChunk(i)}</span>
            <span aria-hidden className="opacity-60">/ / / / / / / / /</span>
        </div>
    ));

    return (
        <div
            className={[
                'relative isolate border-y border-white/10 bg-[#0C0C0F]',
                variant === 'top' ? '' : '',
            ].join(' ')}
        >
            {/* gradient edge */}
            <div
                className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                aria-hidden
            />

            {/* marquee track */}
            <div className="overflow-hidden whitespace-nowrap">
                <div className="tape-run will-change-transform">
                    {content}
                    {content}
                    {content}
                </div>
            </div>
        </div>
    );
}

function binaryChunk(i: number) {
    const chunks = ['1101100101000', '1100100010111', '0011010011110', '0111001110001'];
    return chunks[i % chunks.length];
}
