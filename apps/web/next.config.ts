import path from "path";
import type { NextConfig } from "next";

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_URL}/api/v1/:path*`,
      },
      {
        source: '/health',
        destination: `${API_URL}/health`,
      },
    ];
  },
  // Required for Docker containerisation — generates a self-contained
  // standalone directory at .next/standalone/
  output: "standalone",
  // Point file-tracing to the monorepo root so shared packages are
  // included in the standalone bundle
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@buyonline/ui", "@buyonline/shared-types"],
};

export default nextConfig;
