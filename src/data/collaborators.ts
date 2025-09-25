export type Collaborator = {
    name: string;
    href?: string;
    caption?: string; // shown on hover
};

export const collaborators: Collaborator[] = [
    { name: 'Novacene', href: '#', caption: 'BRAND DESIGN | DEV' },
    { name: 'Shop Circle', href: '#', caption: 'PRODUCT | BRAND' },
    { name: 'Lendhub', href: '#', caption: 'PLATFORM | DESIGN' },
    { name: 'Flooz', href: '#', caption: 'BRAND | MOTION' },
    { name: 'mindsum', href: '#', caption: 'BRAND DESIGN | DEV' },
    { name: 'upkeep', href: '#', caption: 'APP | BRAND' },
    { name: 'Innovation', href: '#', caption: 'PROGRAM | BRAND' },
    { name: 'Slip', href: '#', caption: 'IDENTITY | WEB' },
];
