import { notFound } from 'next/navigation';
import { projects } from '@/data/projects';

export function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
    const proj = projects.find((p) => p.slug === params.slug);
    if (!proj) return notFound();

    return (
        <section className="py-16 prose prose-invert max-w-none">
            <h1 className="mb-2">{proj.title}</h1>
            <p className="opacity-70">{proj.year}</p>
            <p>{proj.summary}</p>
            <p className="opacity-70">Add images, videos, and write-ups here.</p>
        </section>
    );
}
