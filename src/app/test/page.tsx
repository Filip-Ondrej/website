import { LineAnchor } from '@/components/00_LineAnchor';

export default function CleanTestPage() {
    return (
        <div className="bg-black text-white">

            {/* ==================== SECTION 1: HERO ==================== */}
            <section className="relative min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">

                {/* Anchor at top - line enters */}
                <div className="absolute top-20">
                    <LineAnchor id="hero-top" position="left" offsetX={32} />
                </div>

                <div className="container text-center">
                    <h1 className="text-7xl font-bold mb-6">Welcome</h1>
                    <p className="text-2xl opacity-80">Scroll to see the line flow</p>
                </div>

                {/* Anchor at bottom - line exits */}
                <div className="absolute bottom-20">
                    <LineAnchor id="hero-bottom" position="left" offsetX={32} />
                </div>
            </section>

            {/* ==================== SECTION 2: ABOUT ==================== */}
            <section className="relative min-h-screen bg-gradient-to-br from-blue-900 to-black py-20">

                {/* Anchor at top */}
                <div className="absolute top-20">
                    <LineAnchor id="about-top" position="left" offsetX={32} />
                </div>

                <div className="container max-w-4xl">
                    <h2 className="text-6xl font-bold mb-8">About</h2>
                    <p className="text-xl leading-relaxed">
                        This is a normal vertical section. The line goes straight down on the left side.
                    </p>
                </div>

                {/* Anchor at bottom */}
                <div className="absolute bottom-20">
                    <LineAnchor id="about-bottom" position="left" offsetX={32} />
                </div>
            </section>

            {/* ==================== SECTION 3: PROJECTS (ZIGZAG) ==================== */}
            <section className="relative min-h-[200vh] bg-gradient-to-br from-purple-900 via-pink-900 to-black py-20">

                <div className="container max-w-6xl">
                    <h2 className="text-6xl font-bold text-center mb-20">Projects</h2>

                    {/* TOP LEFT - Line enters section */}
                    <div className="relative h-40 flex items-center">
                        <LineAnchor id="projects-entry-left" position="left" offsetX={32} />
                        <div className="ml-20 bg-white/5 p-6 rounded-lg">
                            <p className="text-lg">Line enters on the left ←</p>
                        </div>
                    </div>

                    {/* HORIZONTAL LINE CONTAINER - Both anchors at same Y position! */}
                    <div className="relative h-20 flex items-center justify-between my-20">
                        {/* LEFT anchor */}
                        <LineAnchor id="projects-mid-left" position="left" offsetX={32} />

                        {/* Visual indicator */}
                        <div className="flex-1 text-center">
                            <p className="text-lg opacity-50">← Line crosses here (perfectly horizontal) →</p>
                        </div>

                        {/* RIGHT anchor */}
                        <LineAnchor id="projects-mid-right" position="right" offsetX={32} />
                    </div>

                    {/* Content after first horizontal */}
                    <div className="flex justify-end mb-20">
                        <div className="bg-white/5 p-8 rounded-lg max-w-md">
                            <h3 className="text-2xl mb-4">Right Side Content</h3>
                            <p className="text-lg">Line arrived on the right side!</p>
                        </div>
                    </div>

                    {/* SECOND HORIZONTAL LINE CONTAINER - Both anchors at same Y position! */}
                    <div className="relative h-20 flex items-center justify-between my-20">
                        {/* LEFT anchor */}
                        <LineAnchor id="projects-bottom-left" position="left" offsetX={32} />

                        {/* Visual indicator */}
                        <div className="flex-1 text-center">
                            <p className="text-lg opacity-50">← Line crosses back (perfectly horizontal) →</p>
                        </div>

                        {/* RIGHT anchor */}
                        <LineAnchor id="projects-bottom-right" position="right" offsetX={32} />
                    </div>

                    {/* Content after second horizontal */}
                    <div className="flex justify-start mt-20">
                        <div className="bg-white/5 p-8 rounded-lg max-w-md">
                            <h3 className="text-2xl mb-4">Back to Left</h3>
                            <p className="text-lg">Line came back to the left side!</p>
                        </div>
                    </div>

                    {/* EXIT LEFT */}
                    <div className="relative h-40 flex items-center">
                        <LineAnchor id="projects-exit-left" position="left" offsetX={32} />
                        <div className="ml-20 bg-white/5 p-6 rounded-lg">
                            <p className="text-lg">Line exits section ↓</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== SECTION 4: CONTACT ==================== */}
            <section className="relative min-h-screen bg-gradient-to-br from-green-900 to-black flex items-center justify-center">

                {/* Anchor at top */}
                <div className="absolute top-20">
                    <LineAnchor id="contact-top" position="left" offsetX={32} />
                </div>

                <div className="container text-center">
                    <h2 className="text-6xl font-bold mb-6">Contact</h2>
                    <p className="text-2xl mb-8">Get in touch</p>
                    <div className="bg-white/5 p-8 rounded-lg inline-block">
                        <p className="text-xl">hello@example.com</p>
                    </div>
                </div>

                {/* Anchor at bottom */}
                <div className="absolute bottom-20">
                    <LineAnchor id="contact-bottom" position="left" offsetX={32} />
                </div>
            </section>

            {/* Extra space for outro zone */}
            <div className="h-[50vh] bg-black" />

        </div>
    );
}