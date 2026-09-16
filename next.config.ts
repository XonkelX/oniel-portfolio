import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "oniel-portfolio.vercel.app",
          },
        ],
        destination: "https://onielalejofeliz.space/:path*",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    qualities: [75, 90, 92],
  },
};

export default nextConfig;
