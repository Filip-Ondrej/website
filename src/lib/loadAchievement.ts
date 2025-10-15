// lib/loadAchievement.ts
import matter from 'gray-matter';
import type { AchievementData } from '@/components/AchievementModal';

/**
 * Load achievement markdown file and parse frontmatter + content
 * @param id - Achievement ID (e.g., '2019-06-sydney')
 * @returns Parsed achievement data
 */
export async function loadAchievement(id: string): Promise<AchievementData> {
    try {
        // Fetch the markdown file from /content/achievements/ (in public folder)
        const response = await fetch(`/content/achievements/${id}.md`);

        if (!response.ok) {
            throw new Error(`Failed to load achievement: ${id}`);
        }

        const markdown = await response.text();

        // Parse frontmatter and content using gray-matter
        const { data, content } = matter(markdown);

        // Return structured data with new fields
        return {
            id: data.id || id,
            title: data.title || 'Untitled Achievement',
            date: data.date || '',
            age: data.age,
            //grade: data.grade,
            location: data.location,
            images: data.images || [],
            videos: data.videos,
            tags: data.tags || [],
            hook: data.hook || '',
            pullQuote: data.pullQuote || '',
            challenge: data.challenge || '',
            //challengeImage: data.challengeImage,
            outcome: data.outcome || '',
            //outcomeImage: data.outcomeImage,
            metrics: data.metrics || [],
            story: content.trim(),
            insight: data.insight || '',
        };
    } catch (error) {
        console.error('Error loading achievement:', error);

        // Return fallback data if loading fails
        return {
            id,
            title: 'Achievement Not Found',
            date: '',
            images: [],
            tags: [],
            hook: '',
            pullQuote: '',
            challenge: 'Failed to load achievement data',
            outcome: '',
            metrics: [],
            story: 'Unable to load the full story. Please try again later.',
            insight: '',
        };
    }
}

/**
 * Preload achievement data (optional - for performance)
 * Can be used in page components to prefetch data
 */
export async function preloadAchievement(id: string): Promise<void> {
    try {
        await loadAchievement(id);
    } catch (error) {
        console.error('Error preloading achievement:', error);
    }
}

/**
 * Get list of all available achievement IDs
 * Useful for generating static pages or navigation
 */
export async function getAllAchievementIds(): Promise<string[]> {
    // This would require a manifest file or API endpoint
    // For now, return known IDs manually
    // In production, you'd generate this list dynamically
    return [
        '2019-06-sydney',
        '2023-07-saint-gorazd',
        // Add more as you create them
    ];
}