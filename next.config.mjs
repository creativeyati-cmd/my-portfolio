import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = process.env.VERCEL === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isVercel ? undefined : "standalone",
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
