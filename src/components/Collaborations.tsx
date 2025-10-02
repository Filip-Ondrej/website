'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {collaborators} from '@/data/collaborators';

export default function Collaborations() {
    return (
        <section aria-labelledby="collab-title" className="mt-12">
            <Tape label="COLLABORATIONS & COMPANY EXPERIENCE" reverse={false}/>

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

            <Tape label="COLLABORATIONS & COMPANY EXPERIENCE" reverse/>
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

function Tape({
                  label,
                  code = 'NRG1-SNP-TT',
                  reverse = false,
              }: {
    label: string;
    code?: string;
    reverse?: boolean;
}) {
    const BLOCKS_PER_ROW = 8;

    // timing knobs
    const WAIT_MIN_S = 4, WAIT_MAX_S = 8;         // idle between flickers
    const FLICKER_MIN_S = 0.5, FLICKER_MAX_S = 1.5;   // flicker duration
    const FLICKER_INTERVAL_MS = 10;               // flip cadence

    const codeUp = code.toUpperCase();
    const len = codeUp.length;

    const [current, setCurrent] = useState(codeUp);
    const [mode, setMode] = useState<'word' | 'digit'>('word');

    useEffect(() => {
        const prefersReduced =
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        if (prefersReduced) return;

        let flickerId: number | null = null;
        let settleId: number | null = null;

        const randInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;
        const randMs = (a: number, b: number) => randInt(a * 1000, b * 1000);
        const rand01 = () => (Math.random() < 0.5 ? '0' : '1');

        const startCycle = () => {
            setMode('digit');

            const doFlick = () => {
                // always generate exactly `len` digits to avoid width drift
                let s = '';
                for (let i = 0; i < len; i++) s += rand01();
                setCurrent(s);
            };

            doFlick();
            flickerId = window.setInterval(doFlick, FLICKER_INTERVAL_MS);

            settleId = window.setTimeout(() => {
                if (flickerId) clearInterval(flickerId);
                setCurrent(codeUp);       // settle back to the gene code
                setMode('word');
                settleId = window.setTimeout(startCycle, randMs(WAIT_MIN_S, WAIT_MAX_S));
            }, randMs(FLICKER_MIN_S, FLICKER_MAX_S));
        };

        // kick things off after an initial wait
        settleId = window.setTimeout(
            startCycle,
            Math.floor(Math.random() * (WAIT_MAX_S - WAIT_MIN_S + 1) + WAIT_MIN_S) * 1000
        );

        return () => {
            if (flickerId) clearInterval(flickerId);
            if (settleId) clearTimeout(settleId);
        };
    }, [codeUp, len]); // <- no `current` here

    const Slashes = () => (
        <span className="tape-chunk" aria-hidden="true">
      {'/////////////////////////'}
    </span>
    );

    const Block = (i: number) => (
        <div className="tape-block" key={i}>
            <Slashes />
            <span className="tape-code tape-codeword" aria-hidden="true">
        {current.split('').map((ch, idx) => (
            <span
                className="tape-slot"
                data-mode={mode === 'digit' ? 'digit' : 'word'}
                key={idx}
            >
            {ch}
          </span>
        ))}
      </span>
            <Slashes />
            <span className="tape-label">{label}</span>
        </div>
    );

    const blocks = Array.from({ length: BLOCKS_PER_ROW }, (_, i) => Block(i));

    return (
        <div className="tape">
            <div className={`tape-run ${reverse ? 'tape-run--reverse' : ''}`}>
                {blocks}
                {blocks} {/* duplicate for seamless -50% loop */}
            </div>
        </div>
    );
}

//export default Tape;


