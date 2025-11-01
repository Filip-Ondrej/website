import { linePathConfig } from '@/data/00_linePathConfig';

type SegmentData = {
    length: number;
    scrollMultiplier: number;
    sectionNumber: number;
    type: string;
};

export function generateDynamicPath() {
    const anchors = typeof window !== 'undefined' ? window.lineAnchors || {} : {};

    // Return empty if no anchors registered yet
    if (Object.keys(anchors).length === 0) {
        return {
            pathString: '',
            totalLength: 0,
            segmentData: [] as SegmentData[],
            minY: 0,
            maxY: 0,
        };
    }

    // Find the min and max Y values to normalize the path
    let minY = Infinity;
    let maxY = -Infinity;

    linePathConfig.forEach(segment => {
        const fromPoint = anchors[segment.from];
        const toPoint = anchors[segment.to];

        if (fromPoint && toPoint) {
            minY = Math.min(minY, fromPoint.y, toPoint.y);
            maxY = Math.max(maxY, fromPoint.y, toPoint.y);
        }
    });

    const pathCommands: string[] = [];
    const segmentData: SegmentData[] = [];

    let totalLength = 0;
    let firstPoint = true;

    // Now create the path with normalized Y coordinates
    // Map document Y coordinates to viewport-relative coordinates (0 to 100vh)
    const viewportHeight = window.innerHeight;
    const contentHeight = maxY - minY;
    const scale = viewportHeight / contentHeight;

    linePathConfig.forEach(segment => {
        const fromPoint = anchors[segment.from];
        const toPoint = anchors[segment.to];

        // Skip if anchors not registered yet
        if (!fromPoint || !toPoint) {
            console.warn(`Missing anchor: ${segment.from} or ${segment.to}`);
            return;
        }

        // Normalize Y coordinates to viewport
        // Subtract minY to start at 0, then scale to viewport height
        const normalizedFromY = (fromPoint.y - minY) * scale;
        const normalizedToY = (toPoint.y - minY) * scale;

        // Start path at first point
        if (firstPoint) {
            pathCommands.push(`M ${fromPoint.x} ${normalizedFromY}`);
            firstPoint = false;
        }

        // Calculate segment length (Pythagorean theorem)
        const dx = toPoint.x - fromPoint.x;
        const dy = normalizedToY - normalizedFromY;
        const length = Math.sqrt(dx * dx + dy * dy);

        // Add line to path
        pathCommands.push(`L ${toPoint.x} ${normalizedToY}`);

        totalLength += length;
        segmentData.push({
            length,
            scrollMultiplier: segment.scrollMultiplier || (segment.type === 'horizontal' ? 8 : 1),
            sectionNumber: segment.sectionNumber,
            type: segment.type,
        });
    });

    return {
        pathString: pathCommands.join(' '),
        totalLength,
        segmentData,
        minY,
        maxY,
    };
}

// Calculate the viewport position (0% to 100% of viewport height)
// where the line's "active point" should be positioned
export function calculateLineViewportPosition(scrollY: number): number {
    if (typeof window === 'undefined') return 0;

    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const maxScroll = docHeight - viewportHeight;

    // ZONE DEFINITIONS
    const INTRO_ZONE_HEIGHT = viewportHeight * 0.3;  // First 30vh of scrolling
    const OUTRO_ZONE_HEIGHT = viewportHeight * 0.3;  // Last 30vh of scrolling

    // ZONE THRESHOLDS
    const introZoneEnd = INTRO_ZONE_HEIGHT;
    const normalZoneEnd = maxScroll - OUTRO_ZONE_HEIGHT;

    let viewportPosition = 0;

    if (scrollY <= introZoneEnd) {
        // INTRO ZONE: Line moves from 0% to 30% of viewport
        // Website doesn't move (or moves very slowly)
        viewportPosition = (scrollY / introZoneEnd) * 0.3; // Maps 0 → 0.3
    }
    else if (scrollY <= normalZoneEnd) {
        // NORMAL ZONE: Line moves from 30% to 70% of viewport
        // Website scrolls normally
        const normalZoneProgress = (scrollY - introZoneEnd) / (normalZoneEnd - introZoneEnd);
        viewportPosition = 0.3 + (normalZoneProgress * 0.4); // Maps 0.3 → 0.7
    }
    else {
        // OUTRO ZONE: Line moves from 70% to 100% (exits viewport)
        // Website stops scrolling
        const outroProgress = (scrollY - normalZoneEnd) / OUTRO_ZONE_HEIGHT;
        viewportPosition = 0.7 + (outroProgress * 0.3); // Maps 0.7 → 1.0
    }

    return Math.min(Math.max(viewportPosition, 0), 1);
}

// Calculate how much of the line should be drawn (0 to 1)
export function calculateScrollProgress(scrollY: number, segmentData: SegmentData[]): number {
    if (segmentData.length === 0) return 0;

    // Line progress is 1:1 with scroll through the entire page
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Add extra scroll for outro zone
    const OUTRO_ZONE_HEIGHT = window.innerHeight * 0.3;
    const totalScrollRange = maxScroll + OUTRO_ZONE_HEIGHT;

    const progress = scrollY / totalScrollRange;

    return Math.min(Math.max(progress, 0), 1);
}

// Get extra scroll height needed for outro zone
export function getExtendedScrollHeight(): number {
    if (typeof window === 'undefined') return 0;

    const viewportHeight = window.innerHeight;
    return viewportHeight * 0.3; // 30% extra scroll for outro
}