import createMDX from "@next/mdx";
import supersub from "remark-supersub";
import frontmatter from "./lib/frontmatter.mjs";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  basePath: "",
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  swcMinify: true,
  env: {
    BASE_DOMAIN:
      process.env.NODE_ENV === "production"
        ? (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "docs.discord.sex")
        : (process.env.VERCEL_URL ?? "localhost:3000"),
  },
  // eslint-disable-next-line @typescript-eslint/require-await -- required for Next.js
  async redirects() {
    return [
      {
        source: "/",
        destination: "/intro",
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
