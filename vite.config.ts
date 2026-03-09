import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import pages from "vite-plugin-pages";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkSupersub from "remark-supersub";

const TITLE_REGEX = /<h1 .*?><a .*?>([^<]+)<\/a>.*?<\/h1>|<h1>(.*?)<\/h1>/;
const DEFAULT_SECTION = "Unofficial API Documentation";
const MAIN_CONTENT_REGEX = /<main[^>]*>([\s\S]*?)<\/main>/i;
const ARTICLE_CONTENT_REGEX = /<article[^>]*>([\s\S]*?)<\/article>/i;
const SCRIPT_REGEX = /<script[\s\S]*?<\/script>/gi;
const STYLE_REGEX = /<style[\s\S]*?<\/style>/gi;

function handleDesc(str: string) {
  const content = ARTICLE_CONTENT_REGEX.exec(str)?.[1] ?? MAIN_CONTENT_REGEX.exec(str)?.[1] ?? str;

  return `${content
    .replace(SCRIPT_REGEX, "")
    .replace(STYLE_REGEX, "")
    .replace(TITLE_REGEX, "")
    .replaceAll(/<[^>]*>|\s+/gm, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .trim()
    .slice(0, 200)
    .trim()
    .replace(/&\w+$/, "")}...`;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm, remarkSupersub],
      }),
    },
    react({
      include: /\.(jsx|tsx|mdx|md)$/,
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
    pages({
      dirs: "pages",
      routeStyle: "next",
      extensions: ["tsx", "jsx", "ts", "js", "mdx"],
    }),
  ],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./components"),
      "@lib": path.resolve(__dirname, "./lib"),
    },
  },
  ssgOptions: {
    onPageRendered: (_, html) => {
      const title = TITLE_REGEX.exec(html)?.[1]?.trim();

      return html
        .replaceAll("__PLACEHOLDER_TITLE__", title ? `${title} - Discord Userdoccers` : DEFAULT_SECTION)
        .replaceAll("__PLACEHOLDER_DESCRIPTION__", handleDesc(html));
    },
  },
  preview: {
    allowedHosts: true,
  },
});
