import frontmatter from "@lib/frontmatter";
import createMDX from "@next/mdx";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
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
  // eslint-disable-next-line @typescript-eslint/require-await -- required for Next.js
  async redirects() {
    return [
      {
        source: "/intro",
        destination: "/",
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

export default withMDX(config);

initOpenNextCloudflareForDev();
