import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker containerisation — generates a self-contained
  // standalone directory at .next/standalone/
  output: "standalone",
  // Point file-tracing to the monorepo root so shared packages are
  // included in the standalone bundle
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@buyonline/ui", "@buyonline/shared-types"],
};

export default nextConfig;
