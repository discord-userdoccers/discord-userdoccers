import createMDX from "@next/mdx";
import supersub from "remark-supersub";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  basePath: "",
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  swcMinify: true,
  async redirects() {
    return [{
      source:'/',
      destination:'/intro',
      permanent: true,
    }]
  }
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [supersub],
    rehypePlugins: [],
  },
});

export default withMDX(config);
