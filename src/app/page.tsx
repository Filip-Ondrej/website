import TimelineTitle from "@/components/03_TimelineTitle";

import Collaborations from '@/components/Collaborations';
import ProgressTimeline from '@/components/ProgressTimeline';
import PromoVideo from '@/components/02_PromoVideo';
import TitleReveal from '@/components/02_TitleReveal';
import Projects from '@/components/Projects';
//import { PROJECTS_TOP3 } from '@/data/projects';
import Hero from '@/components/01_Hero';

import Recognition from '@/components/Recognition';

import { LineAnchor } from '@/components/00_LineAnchor';

//import { filipRealEvents, type ProgressEvent } from '@/data/graphData';
//const events: ProgressEvent[] = filipRealEvents; // Or define your own array here

export default function Home() {
    return (
        <main>
            <section className="relative min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
                {/* Anchor at top - line enters */}
                <div className="absolute top-20">
                    <LineAnchor id="her-top" position="left" offsetX={100} />
                </div>

                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
                        Official launch on <span className="whitespace-nowrap">November 4th</span>
                    </h1>

                    {/* Bigger subtitle */}
                    <p className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium opacity-90">
                        Meanwhile, check out my other socials:
                    </p>

                    {/* Bigger buttons */}
                    <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                        <a
                            href="https://www.linkedin.com/in/filip-ondrej/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-2xl border border-white/25 px-7 py-3 md:px-8 md:py-4 text-lg md:text-xl font-semibold hover:bg-white/10 active:scale-[0.99] transition"
                            aria-label="Open Filip Ondrej LinkedIn"
                        >
                            LinkedIn
                        </a>

                        <a
                            href="mailto:ondrejfilip152@gmail.com"
                            className="rounded-2xl border border-white/25 px-7 py-3 md:px-8 md:py-4 text-lg md:text-xl font-semibold hover:bg-white/10 active:scale-[0.99] transition"
                            aria-label="Email Filip Ondrej"
                        >
                            ondrejfilip152@gmail.com
                        </a>
                    </div>
                </div>

                {/* Anchor at bottom - line exits */}
                <div className="absolute bottom-20">
                    <LineAnchor id="her-bottom" position="left" offsetX={100} />
                </div>
            </section>
            <Hero />
            <TitleReveal />
            <PromoVideo />
            <TimelineTitle />
            <ProgressTimeline />
            <Projects />
            <Collaborations />
            <Recognition />
            {/*<Recognition />*/}
        </main>
    );
}
