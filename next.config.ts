import type { NextConfig } from "next";

const mediaBase = process.env.S3_PUBLIC_URL?.trim() || process.env.S3_ENDPOINT?.trim();
const mediaRemotePatterns = mediaBase
  ? (() => {
      const url = new URL(mediaBase);
      return [{ protocol: url.protocol.replace(":", "") as "http" | "https", hostname: url.hostname, pathname: "/**" }];
    })()
  : [];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    cpus: 1,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [55, 60, 65, 75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      ...mediaRemotePatterns,
    ],
  },
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
