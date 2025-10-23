import Collaborations from '@/components/Collaborations';
import ProgressTimeline from '@/components/ProgressTimeline';
import PromoVideo from '@/components/PromoVideo';
import Projects from '@/components/Projects';
//import { PROJECTS_TOP3 } from '@/data/projects';
import Hero from '@/components/Hero';

//import { filipRealEvents, type ProgressEvent } from '@/data/graphData';
//const events: ProgressEvent[] = filipRealEvents; // Or define your own array here

export default function Home() {
    return (
        <main>
            {/* Banner header with placeholder “image” (solid color block) */}
            {/*<section className="border-b border-white/10">
                <div className="w-full h-[42vh] md:h-[56vh] bg-[#17171c]" aria-label="Header banner placeholder" />
                <div className="container py-10">
                    <h1 className="h1">Heading for the page</h1>
                    <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[color:var(--color-muted)]">
                        Replace the block above with a real image/video later. For now, it’s a calm placeholder.
                    </p>
                </div>
            </section>*/}
            <Hero
                imageSrc="/images/me.jpg"
                titleLines={['Filip Ondrej', 'Creative Webflow Dev']}
                kicker="[00] introduction"
            />
            <PromoVideo />
            <ProgressTimeline />
            <Projects />
            <Collaborations />
        </main>
    );
}
