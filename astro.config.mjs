import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import remarkSuperSub from "remark-supersub";
import mdx from "@astrojs/mdx";
import { shikiDiffNotation } from "./shiki/diffnotation";
import { shikiMetaParser } from "./shiki/metaparser";
import { shikiLineNumbers } from "./shiki/linenumbers";

// https://astro.build/config
export default defineConfig({
	output: "static",
	site: "https://userdoccers.voidfill.cc",
	integrations: [tailwind(), sitemap(), mdx()],
	redirects: {
		"/": "intro",
	},
	markdown: {
		remarkPlugins: [remarkSuperSub],
		shikiConfig: {
			transformers: [shikiMetaParser(), shikiDiffNotation(), shikiLineNumbers()],
			themes: {
				light: "github-light",
				dark: "github-dark",
			},
		},
	},
});
