import { notFound } from 'next/navigation';
import { projects } from '@/data/projects';

// Pre-generate all slugs for static export
export function generateStaticParams() {
    return projects.map(p => ({ slug: p.slug }));
}

// ✅ Next 15: params can be a Promise; await it
export default async function ProjectPage(
    props: { params: Promise<{ slug: string }> }
) {
    const { slug } = await props.params;

    const proj = projects.find(p => p.slug === slug);
    if (!proj) notFound();

    return (
        <article className="prose prose-invert max-w-none py-12">
            <h1 className="font-bank">{proj.title}</h1>
            <p className="opacity-70">{proj.year}</p>

            <h2>Problem</h2>
            <p>State the constraint and where current methods fail.</p>

            <h2>Design</h2>
            <ul>
                <li>Mechanics: …</li>
                <li>Control: …</li>
                <li>Materials: …</li>
            </ul>

            <h2>Demo</h2>
            <p>Embed a short clip or image grid.</p>

            <h2>Metrics</h2>
            <ul>
                <li>Accuracy: …</li>
                <li>Throughput: …</li>
                <li>Setup time: …</li>
            </ul>

            <h2>What I’d improve next</h2>
            <p>Roadmap and experiments.</p>
        </article>
    );
}
