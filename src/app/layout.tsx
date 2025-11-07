import {ProgressLine} from '@/components/00_ProgressLine';
import LoadingWrapper from '@/components/00_LoadingAnimation';
import './globals.css';
import type {Metadata} from 'next';
import {Rajdhani} from 'next/font/google';
import Link from 'next/link';

const rajdhani = Rajdhani({subsets: ['latin'], weight: ['400', '600', '700']});

export const metadata: Metadata = {
    title: 'Filip Ondrej',
    description: 'Filip Ondrej — 10 Years of Robotics Portfolio',
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${rajdhani.className}`}>
        <LoadingWrapper>
            <ProgressLine/>
            <header className="sticky top-0 z-50 backdrop-blur border-b border-white/10">
                <nav className="container py-3 flex items-center justify-between">
                    <Link href="/" className="font-[var(--font-bank)] tracking-wide text-lg">FILIP ONDREJ</Link>
                </nav>
            </header>

            {children}

            <footer className="container py-12 text-sm opacity-60 border-t border-white/10">
                © {new Date().getFullYear()} Filip Ondrej
            </footer>
        </LoadingWrapper>
        </body>
        </html>
    );
}
