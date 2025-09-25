'use client';

import Link from 'next/link';
import {collaborators} from '@/data/collaborators';

export default function Collaborations() {
    return (
        <section aria-labelledby="collab-title" className="mt-12">
            <Tape label="COLLABORATIONS & BRAND EXPERIENCE" reverse={false}/>

            <div className="relative bg-[#0C0C0F]">
                <h2 id="collab-title" className="sr-only">
                    Collaborations & Brand Experience
                </h2>

                {/* Brands row */}
                <div className="brands overflow-hidden select-none">
                    <div className="brands-track">
                        <Row/>
                        <Row/>
                    </div>
                </div>
            </div>

            <Tape label="COLLABORATIONS & BRAND EXPERIENCE" reverse/>
        </section>
    );
}

function Row() {
    return (
        <ul className="flex items-stretch gap-0">
            {collaborators.map((c, idx) => (
                <li key={`${c.name}-${idx}`} className="brand">
                    {/* clickable area; .brand handles sizing/centering */}
                    {c.href ? (
                        <Link href={c.href} className="contents" aria-label={c.name}/>
                    ) : null}

                    {/* label */}
                    <span className="brand-name">{c.name}</span>

                    {/* hover chrome (fills full tile) */}
                    <span className="brand-card" aria-hidden="true">
            <span className="brand-corner">↗</span>
            <span className="brand-caption">[{c.caption ?? 'BRAND'}]</span>
          </span>
                </li>
            ))}
        </ul>
    );
}

function Tape({label, reverse = false}: { label: string; reverse?: boolean }) {
    const block = (
        <div className="tape-block">
    <span className="tape-chunk" aria-hidden="true">
      {'/////////////////////////'}
    </span>
            <span aria-hidden="true">{binaryChunk()}</span>
            <span className="tape-chunk" aria-hidden="true">
      {'/////////////////////////'}
    </span>
            <span className="tracking-[0.18em] text-[11px] sm:text-[12px]">
      {label}
    </span>
        </div>
    );

    return (
        <div className="tape">
            <div className={`tape-run ${reverse ? 'tape-run--reverse' : ''}`}>
                {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="shrink-0">
                        {block}
                    </div>
                ))}
            </div>
        </div>
    );
}

function binaryChunk() {
    const pool = [
        '1101100101000',
        '1100100010111',
        '0011010011110',
        '0111001110001',
        '0011010010110',
    ];
    return pool[Math.floor(Math.random() * pool.length)];
}
