import './globals.css';
import type { Metadata } from 'next';
import { Rajdhani } from 'next/font/google';
import Link from 'next/link';

import localFont from 'next/font/local';

// Bank Gothic family with multiple weights
const bankGothic = localFont({
    src: [
        { path: '../assets/fonts/Bank Gothic Light Regular.otf', weight: '300', style: 'normal' },
        { path: '../assets/fonts/bank gothic medium bt.ttf', weight: '400', style: 'normal' },
        { path: '../assets/fonts/BankGothic Bold.ttf', weight: '700', style: 'normal' },
    ],
    variable: '--font-bank',
});
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['400','600','700'] });

export const metadata: Metadata = {
    title: 'Filip Ondrej — Portfolio',
    description: 'Robotics & large-scale 3D printing projects.',
    metadataBase: new URL('https://filipondrej.com'),
    openGraph: { title: 'Filip Ondrej — Portfolio', url: 'https://filipondrej.com' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${rajdhani.className} ${bankGothic.variable} min-h-screen bg-black text-zinc-100`}>
        <header className="sticky top-0 z-50 backdrop-blur border-b border-white/10">
            <h1 className="font-[var(--font-bank)] text-5xl">
                FILIP ONDREJ
            </h1>
            <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                <Link href="/" className="tracking-wide">FILIP ONDREJ</Link>
                <div className="space-x-6 text-sm">
                    <Link href="/projects" className="opacity-80 hover:opacity-100">Projects</Link>
                    <Link href="/about" className="opacity-80 hover:opacity-100">About</Link>
                    <Link href="/contact" className="opacity-80 hover:opacity-100">Contact</Link>
                </div>
            </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-12 text-sm opacity-60">
            © {new Date().getFullYear()} Filip Ondrej
        </footer>
        </body>
        </html>
    );
}
