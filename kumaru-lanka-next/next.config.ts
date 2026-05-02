import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  async rewrites() {
    // Local dev convenience: Next.js runs on :3000, API on :5080.
    // In production (single-domain), `/api/*` is served by ASP.NET directly.
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination: "http://localhost:5080/api/:path*",
          },
        ]
      : [];
  },
};

export default nextConfig;
