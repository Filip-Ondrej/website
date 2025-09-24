'use client';

import Link from 'next/link';
import { collaborators } from '@/data/collaborators';

/**
 * Full-bleed collaborations band
 * - Tighter paddings
 * - Brighter text
 * - Items sit closer and share borders
 * - Top/Bottom tapes still counter-scroll + pause on hover
 */
export default function Collaborations() {
    return (
        <section aria-labelledby="collab-title" className="mt-12">
            <Tape label="COLLABORATIONS & BRAND EXPERIENCE" reverse={false} />

            {/* Brands row (full bleed) */}
            <div className="relative bg-[#0C0C0F] border-y border-white/10">
                <h2 id="collab-title" className="sr-only">
                    Collaborations & Brand Experience
                </h2>

                <div className="brands overflow-hidden select-none">
                    <div className="brands-track">
                        <Row />
                        <Row />
                    </div>
                </div>
            </div>

            <Tape label="COLLABORATIONS & BRAND EXPERIENCE" reverse />
        </section>
    );
}

function Row() {
    return (
        <ul className="flex items-stretch gap-0">
            {collaborators.map((c, idx) => {
                const inner = (
                    <span className="relative inline-block">
            <span className="brand-name">{c.name}</span>
            <span className="brand-card" aria-hidden>
              <span className="brand-corner">↗</span>
              <span className="brand-caption">[{c.caption ?? 'BRAND'}]</span>
            </span>
          </span>
                );

                return (
                    <li
                        key={`${c.name}-${idx}`}
                        className="brand-item shrink-0"
                    >
                        {c.href ? (
                            <Link
                                href={c.href}
                                className="brand block px-[5vw] sm:px-[6vw] py-12 md:py-14 text-[clamp(18px,2.1vw,28px)] font-semibold tracking-wide text-white/90"
                            >
                                {inner}
                            </Link>
                        ) : (
                            <span className="brand block px-[5vw] sm:px-[6vw] py-12 md:py-14 text-[clamp(18px,2.1vw,28px)] font-semibold tracking-wide text-white/90">
                {inner}
              </span>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

/** Top/bottom moving tapes */
function Tape({ label, reverse = false }: { label: string; reverse?: boolean }) {
    const block = (
        <div className="flex items-center gap-3 px-4">
      <span className="tracking-[0.18em] text-[11px] sm:text-[12px]">
        {label}
      </span>
            <span aria-hidden className="opacity-70">/ / / / / / / / / / /</span>
            <span aria-hidden className="opacity-70">{binaryChunk()}</span>
            <span aria-hidden className="opacity-70">/ / / / / / /</span>
        </div>
    );

    return (
        <div className="tape border-y border-white/10 bg-[#0C0C0F]">
            <div className={`tape-run ${reverse ? 'tape-run--reverse' : ''}`}>
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="shrink-0">
                        {block}
                    </div>
                ))}
            </div>
        </div>
    );
}

function binaryChunk() {
    const pool = ['1101100101000', '1100100010111', '0011010011110', '0111001110001', '0011010010110'];
    return pool[Math.floor(Math.random() * pool.length)];
}
