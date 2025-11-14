import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
import frontmatter from "@lib/frontmatter";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import supersub from "remark-supersub";

const config: NextConfig = {
  reactStrictMode: true,
  basePath: "",
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  env: {
    BASE_DOMAIN:
      process.env.CF_PAGES_URL ?? (process.env.NODE_ENV === "production" ? "docs.discord.food" : "localhost:3000"),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint-disable-next-line @typescript-eslint/require-await -- required for Next.js
  async redirects() {
    return [
      {
        source: "/",
        destination: "/intro",
        permanent: true,
      },
      // for convenience
      {
        source: "/_github",
        destination: "https://github.com/discord-userdoccers/discord-userdoccers",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [supersub, frontmatter],
    rehypePlugins: [],
  },
});

if (process.env.NODE_ENV === "development") {
  setupDevPlatform();
}

export default withMDX(config);
