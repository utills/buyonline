import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@buyonline/ui', '@buyonline/shared-types'],
};

export default nextConfig;
