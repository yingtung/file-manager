/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Note: Using remotePatterns instead of domains for Next.js 13+
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
