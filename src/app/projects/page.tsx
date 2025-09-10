import Link from 'next/link';
import { projects } from '@/data/projects';

export default function Projects() {
    return (
        <section className="py-16">
            <h2 className="text-3xl font-semibold mb-6">Projects</h2>
            <div className="grid gap-6 sm:grid-cols-2">
                {projects.map((p) => (
                    <article key={p.slug} className="rounded-2xl border border-white/10 p-6 hover:border-white/30 transition">
                        <h3 className="text-xl font-semibold">{p.title}</h3>
                        <p className="text-sm opacity-70">{p.year}</p>
                        <p className="mt-2 opacity-80">{p.summary}</p>
                        <div className="mt-4">
                            <Link className="underline opacity-90" href={`/projects/${p.slug}`}>Details</Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
