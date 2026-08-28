import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const payloadConfigAlias = path.resolve(dirname, "./src/payload.config.ts");

const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["sharp"],
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias["@payload-config"] = payloadConfigAlias;
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default withPayload(nextConfig);
