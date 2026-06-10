import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    loader: "default",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "muvbisveiqaorgdjeaph.supabase.co",
      },
    ],
  },
};

export default nextConfig;
