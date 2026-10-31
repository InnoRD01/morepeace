import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is pre-rendered, so build plain static files (into out/) that any
  // static host, including Cloudflare Pages, can serve.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
