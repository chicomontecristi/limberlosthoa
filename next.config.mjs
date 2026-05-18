/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — produces /out for Cloudflare Pages.
  // Comment this out if deploying to Vercel and you want SSR.
  output: 'export',

  // Static export requires unoptimized images.
  images: { unoptimized: true },

  // Trailing slashes keep static hosts happy.
  trailingSlash: true,

  // Don't fail the production build on lint warnings during scaffold.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
