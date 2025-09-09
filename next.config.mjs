/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',              // enable static export to /out
  images: { unoptimized: true }, // make next/image work without a server
};

export default nextConfig;
