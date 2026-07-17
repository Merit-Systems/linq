import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@agentcash/router", "@agentcash/telemetry"],
  serverExternalPackages: ["mppx", "@clickhouse/client"],
  turbopack: {
    root,
  },
};

export default nextConfig;
