import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Make a static export to /out when running `next build`
    output: 'export',
    images: { unoptimized: true }, // allows next/image without an image server
};

export default nextConfig;
