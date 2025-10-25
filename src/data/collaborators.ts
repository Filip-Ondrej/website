export type Collaborator = {
    name: string;
    logo?: string;
    href?: string;
    caption?: string;
    slug: string; // Article ID - links to /content/collaborations/{slug}.md
};

/**
 * Filip's Collaboration Network
 *
 * Each collaboration links to: /public/content/collaborations/{slug}.md
 *
 * Example:
 *   slug: 'boyser' → loads /content/collaborations/boyser.md
 *   slug: 'world-champion-2024' → loads /content/collaborations/world-champion-2024.md
 */
export const collaborators: Collaborator[] = [
    {
        name: 'Junior Akademia',
        logo: '/logos/juniorakademia.svg',
        href: 'https://juniorakademia.spse-po.sk/',
        caption: 'Tutoring',
        slug: 'junior-akademia'
    },
    {
        name: 'VALT',
        logo: '/logos/valt.svg',
        href: 'https://projekty.spse.cz/vamlte/output.html',
        caption: 'Erasmus+ Project',
        slug: 'valt'
    },
    {
        name: 'Education',
        logo: '/logos/education.svg',
        href: 'https://www.minedu.sk/',
        caption: 'Support',
        slug: 'saint-gorazd-award'
    },
    {
        name: 'MTEC',
        logo: '/logos/mtec.svg',
        href: 'https://mtec.et8.tuhh.de/institute',
        caption: 'Research Assistant',
        slug: 'mtec'
    },
    {
        name: 'PSK',
        logo: '/logos/psk.svg',
        href: 'https://psk.sk/',
        caption: 'Support',
        slug: 'psk-award'
    },
    {
        name: 'IMEK',
        logo: '/logos/imek.svg',
        href: 'https://www.tuhh.de/imek/en/institute-for-mechatronics-in-mechanics-tuhh',
        caption: 'Tutoring',
        slug: 'imek'
    },
    {
        name: 'NPI',
        logo: '/logos/npi.svg',
        href: 'https://newproductioninstitute.de/en',
        caption: 'Innovation Partner',
        slug: 'npi'
    },
    {
        name: 'Economy',
        logo: '/logos/economy.svg',
        href: 'https://www.economy.gov.sk/',
        caption: 'Support',
        slug: 'young-creator-award'
    },
    {
        name: 'MakersHome',
        logo: '/logos/makershome.svg',
        href: 'https://makershome.de/',
        caption: 'Innovation Hub',
        slug: 'makershome'
    },
    {
        name: 'IDAC',
        logo: '/logos/idaclong.svg',
        href: 'https://www.tuhh.de/idac/news',
        caption: 'Innovation Partner',
        slug: 'idac'
    },
    {
        name: 'SPSEPO',
        logo: '/logos/spsepo.svg',
        href: 'https://www.spse-po.sk/',
        caption: 'Support',
        slug: 'spsepo-valedictorian'
    },
    {
        name: 'Vectorealism',
        logo: '/logos/vectorealism.svg',
        href: 'https://www.vectorealism.com/en/',
        caption: 'Internship',
        slug: 'vectorealism'
    },
    {
        name: 'Erasmus',
        logo: '/logos/erasmus.svg',
        href: 'https://erasmus.spse-po.sk/',
        caption: 'Mobility',
        slug: 'erasmus-mobility'
    },
    {
        name: 'Haniska',
        logo: '/logos/haniska.svg',
        href: 'https://www.obechaniska.sk/',
        caption: 'Project Collaboration',
        slug: 'haniska'
    },
    {
        name: 'Boyser',
        logo: '/logos/boyser.svg',
        href: 'https://www.boyser.sk/englishindex.php?id=about-us',
        caption: 'Internship',
        slug: 'boyser'
    },
    {
        name: 'Startupport',
        logo: '/logos/startupport.svg',
        href: 'https://startupport.de/en/',
        caption: 'Innovation Hub',
        slug: 'startupport'
    },
    {
        name: 'Cannaxy',
        logo: '/logos/cannaxy.svg',
        href: 'https://cannaxy.space/',
        caption: 'Innovation Partner',
        slug: 'cannaxy'
    },
];