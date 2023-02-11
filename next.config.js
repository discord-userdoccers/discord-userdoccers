const withMDX = require("@next/mdx")({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
module.exports = withMDX({
  reactStrictMode: true,
  basePath: "",
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
});
