/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'docs',
    images: {
        unoptimized: true,
        loader: "akamai",
        path: "/",
    },
};

export default nextConfig;
