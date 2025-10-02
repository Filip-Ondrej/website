export type Collaborator = {
    name: string;
    logo?: string;    // /logos/*.svg under /public
    href?: string;
    caption?: string; // shown on hover; omit to hide
};

//Internship; Research Assistant; Tutoring; Innovation Partner; Support; Erasmus+ Project; Mobility; Project Collaboration;
export const collaborators: Collaborator[] = [
    { name: 'Junior Akademia', logo: '/logos/juniorakademia.svg', href: 'https://juniorakademia.spse-po.sk/', caption: 'Tutoring' },
    { name: 'VALT',          logo: '/logos/valt.svg',          href: 'https://projekty.spse.cz/vamlte/output.html', caption: 'Erasmus+ Project' },
    { name: 'Education',     logo: '/logos/education.svg',     href: 'https://www.minedu.sk/', caption: 'Support' },
    { name: 'MTEC',          logo: '/logos/mtec.svg',          href: 'https://mtec.et8.tuhh.de/institute', caption: 'Research Assistant' },
    { name: 'PSK',           logo: '/logos/psk.svg',           href: 'https://psk.sk/', caption: 'Support' },
    { name: 'IMEK',          logo: '/logos/imek.svg',          href: 'https://www.tuhh.de/imek/en/institute-for-mechatronics-in-mechanics-tuhh', caption: 'Tutoring' },
    { name: 'NPI',           logo: '/logos/npi.svg',           href: 'https://newproductioninstitute.de/en', caption: 'Innovation Partner' },
    { name: 'Economy',       logo: '/logos/economy.svg',       href: 'https://www.economy.gov.sk/', caption: 'Support' },
    { name: 'MakersHome',    logo: '/logos/makershome.svg',    href: 'https://makershome.de/', caption: 'Innovation Hub' },
    { name: 'IDAC',          logo: '/logos/idaclong.svg',      href: 'https://www.tuhh.de/idac/news', caption: 'Innovation Partner' },
    { name: 'SPSEPO',        logo: '/logos/spsepo.svg',        href: 'https://www.spse-po.sk/', caption: 'Support' },
    { name: 'Vectorealism',  logo: '/logos/vectorealism.svg',  href: 'https://www.vectorealism.com/en/', caption: 'Insternship' },
    { name: 'Erasmus',       logo: '/logos/erasmus.svg',       href: 'https://erasmus.spse-po.sk/', caption: 'Mobility' },
    { name: 'Haniska',       logo: '/logos/haniska.svg',       href: 'https://www.obechaniska.sk/', caption: 'Project Collaboration' },
    { name: 'Boyser',        logo: '/logos/boyser.svg',        href: 'https://www.boyser.sk/englishindex.php?id=about-us', caption: 'Internship' },
    { name: 'Startupport',   logo: '/logos/startupport.svg',   href: 'https://startupport.de/en/', caption: 'Innovation Hub' },
    { name: 'Cannaxy',       logo: '/logos/cannaxy.svg',       href: 'https://cannaxy.space/', caption: 'Innovation Partner' },
];