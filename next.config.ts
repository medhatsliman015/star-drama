import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  output: "standalone",
};

export default nextConfig;
