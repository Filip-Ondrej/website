'use client';

import Link from 'next/link';
import { collaborators } from '@/data/collaborators';

export default function Collaborations() {
    return (
        <section aria-labelledby="collab-title" className="mt-16">
            <Tape label="COLLABORATIONS & BRAND EXPERIENCE" reverse={false} />

            <div className="relative bg-[#0C0C0F] border-y border-white/10">
                <h2 id="collab-title" className="sr-only">Collaborations & Brand Experience</h2>

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
            {collaborators.map((c) => (
                <li key={c.name} className="shrink-0">
                    {c.href ? (
                        <Link
                            href={c.href}
                            className="brand block px-[8vw] sm:px-[10vw] py-16 md:py-20 text-[clamp(20px,2.6vw,34px)] font-semibold tracking-wide text-white/80"
                        >
              <span className="relative inline-block">
                <span className="brand-name">{c.name}</span>
                <span className="brand-card" aria-hidden>
                  <span className="brand-corner">↗</span>
                  <span className="brand-caption">[{c.caption ?? 'BRAND'}]</span>
                </span>
              </span>
                        </Link>
                    ) : (
                        <span className="brand block px-[8vw] sm:px-[10vw] py-16 md:py-20 text-[clamp(20px,2.6vw,34px)] font-semibold tracking-wide text-white/80">
              <span className="relative inline-block">
                <span className="brand-name">{c.name}</span>
                <span className="brand-card" aria-hidden>
                  <span className="brand-corner">↗</span>
                  <span className="brand-caption">[{c.caption ?? 'BRAND'}]</span>
                </span>
              </span>
            </span>
                    )}
                </li>
            ))}
        </ul>
    );
}

function Tape({ label, reverse = false }: { label: string; reverse?: boolean }) {
    const block = (
        <div className="flex items-center gap-4 px-6">
            <span className="tracking-[0.18em] text-[11px] sm:text-[12px]">{label}</span>
            <span aria-hidden className="opacity-60">/ / / / / / / / / / / / / /</span>
            <span aria-hidden className="opacity-60">{binaryChunk()}</span>
            <span aria-hidden className="opacity-60">/ / / / / / / / /</span>
        </div>
    );

    return (
        <div className="tape border-y border-white/10 bg-[#0C0C0F]">
            <div className={`tape-run ${reverse ? 'tape-run--reverse' : ''}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="shrink-0">{block}</div>
                ))}
            </div>
        </div>
    );
}

function binaryChunk() {
    const pool = ['1101100101000', '1100100010111', '0011010011110', '0111001110001', '0011010010110'];
    return pool[Math.floor(Math.random() * pool.length)];
}
