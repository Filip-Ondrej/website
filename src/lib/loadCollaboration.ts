// lib/loadCollaboration.ts
import matter from 'gray-matter';
import type { CollaborationData } from '@/components/CollaborationModal';

/**
 * Load collaboration markdown file and parse frontmatter + content
 * @param slug - Collaboration slug/ID (e.g., 'boyser', 'mtec')
 * @returns Parsed collaboration data
 */
export async function loadCollaboration(slug: string): Promise<CollaborationData> {
    try {
        // Fetch the markdown file from /content/collaborations/ (in public folder)
        const response = await fetch(`/content/collaborations/${slug}.md`);

        if (!response.ok) {
            throw new Error(`Failed to load collaboration: ${slug}`);
        }

        const markdown = await response.text();

        // Parse frontmatter and content using gray-matter
        const { data, content } = matter(markdown);

        // Return structured data
        return {
            slug: data.slug || slug,
            name: data.name || 'Untitled Collaboration',
            description: data.description || '',
            established: data.established,
            duration: data.duration,
            role: data.role,
            location: data.location,
            outcomes: data.outcomes || [],
            tags: data.tags || [],
            images: data.images || [],
            story: content.trim(),
        };
    } catch (error) {
        console.error('Error loading collaboration:', error);

        // Return fallback data if loading fails
        return {
            slug,
            name: 'Collaboration Not Found',
            description: 'Failed to load collaboration data',
            outcomes: [],
            tags: [],
            images: [],
            story: 'Unable to load the full story. Please try again later.',
        };
    }
}

/**
 * Preload collaboration data (optional - for performance)
 * Can be used in page components to prefetch data
 */
export async function preloadCollaboration(slug: string): Promise<void> {
    try {
        await loadCollaboration(slug);
    } catch (error) {
        console.error('Error preloading collaboration:', error);
    }
}

/**
 * Get list of all available collaboration slugs
 * Useful for generating static pages or navigation
 */
export async function getAllCollaborationSlugs(): Promise<string[]> {
    // This would require a manifest file or API endpoint
    // For now, return known slugs manually
    // In production, you'd generate this list dynamically
    return [
        'boyser',
        'saint-gorazd-award',
        'young-creator-award',
        'mtec',
        'imek',
        'spsepo-valedictorian',
        'junior-akademia',
        'valt',
        'psk-award',
        'npi',
        'makershome',
        'idac',
        'vectorealism',
        'erasmus-mobility',
        'haniska',
        'startupport',
        'cannaxy',
    ];
}