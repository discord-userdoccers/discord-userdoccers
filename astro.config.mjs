import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import remarkSuperSub from "remark-supersub";
import node from "@astrojs/node";
import mdx from "@astrojs/mdx";
import { shikiDiffNotation } from "./shiki/diffnotation";
import { shikiMetaParser } from "./shiki/metaparser";
import { shikiLineNumbers } from "./shiki/linenumbers";

// https://astro.build/config
export default defineConfig({
	output: "static",
	site: "https://docs.discord.sex",
	integrations: [tailwind(), sitemap(), mdx()],
	adapter: node({
		mode: "standalone",
	}),
	redirects: {
		"/": "intro",
	},
	markdown: {
		remarkPlugins: [remarkSuperSub],
		shikiConfig: {
			transformers: [shikiMetaParser(), shikiDiffNotation(), shikiLineNumbers()],
		},
	},
});
