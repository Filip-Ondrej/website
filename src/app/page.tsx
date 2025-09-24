import Collaborations from '@/components/Collaborations';

export default function Home() {
    return (
        <main>
            {/* Banner header with placeholder “image” (solid color block) */}
            <section className="border-b border-white/10">
                <div className="w-full h-[42vh] md:h-[56vh] bg-[#17171c]" aria-label="Header banner placeholder" />
                <div className="container py-10">
                    <h1 className="h1">Heading for the page</h1>
                    <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[color:var(--color-muted)]">
                        Replace the block above with a real image/video later. For now, it’s a calm placeholder.
                    </p>
                </div>
            </section>

            {/* Collaborations */}
            <Collaborations />
        </main>
    );
}
