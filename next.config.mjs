import createMDX from "@next/mdx";
import supersub from "remark-supersub";
import frontmatter from "./lib/frontmatter.mjs";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  basePath: "",
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  swcMinify: true,
  env: {
    BASE_DOMAIN:
      process.env.CF_PAGES_URL ?? (process.env.NODE_ENV === "production"
        ? "docs.discord.food"
        : "localhost:3000"),
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
  await setupDevPlatform();
}

export default withMDX(config);
