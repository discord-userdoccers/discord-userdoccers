import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import remarkSuperSub from "remark-supersub";
import node from "@astrojs/node";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
	output: "hybrid",
	site: "https://docs.discord.sex",
	integrations: [tailwind(), sitemap(), mdx()],
	adapter: node({
		mode: "standalone",
	}),
	markdown: {
		remarkPlugins: [remarkSuperSub],
	},
});
