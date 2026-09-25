import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@metaplex-foundation/mpl-core",
    "@metaplex-foundation/umi",
    "@metaplex-foundation/umi-bundle-defaults",
    "sharp",
  ],
};

export default nextConfig;
