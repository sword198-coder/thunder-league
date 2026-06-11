import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "muvbisveiqaorgdjeaph.supabase.co",
      },
    ],
  },
};

export default nextConfig;
