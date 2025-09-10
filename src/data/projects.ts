export type Project = {
    title: string;
    year: string;
    summary: string;
    slug: string;
    image?: string; // place files in /public
    links?: { label: string; href: string }[];
};

export const projects: Project[] = [
    {
        title: 'Autonomous 3D Printer Prototype',
        year: '2025',
        summary: '2×2 m module, real-time calibration, multi-nozzle head.',
        slug: 'autonomous-3d-printer',
    },
    {
        title: 'Noise Monitoring “Hush Guard”',
        year: '2024',
        summary: 'IoT beacons + cloud dashboard (hardware + SaaS).',
        slug: 'hush-guard',
    },
];
