import { fileURLToPath } from "node:url";
import { dirname, relative } from "node:path";
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import remarkSuperSub from "remark-supersub";
import AutoImport from "astro-auto-import";
import mdx from "@astrojs/mdx";
import { shikiDiffNotation } from "./src/shiki/diffnotation";
import { shikiMetaParser } from "./src/shiki/metaparser";
import { shikiLineNumbers } from "./src/shiki/linenumbers";
import { spawn } from "node:child_process";

// https://astro.build/config
export default defineConfig({
	output: "static",
	site: "https://userdoccers.voidfill.cc",
	integrations: [
		tailwind(),
		sitemap(),
		AutoImport({
			imports: ["./src/components/Alert.astro", "./src/components/RouteHeader.astro"],
		}),
		mdx(),
		{
			name: "pagefind-post-build",
			hooks: {
				"astro:build:done": ({ dir }) => {
					const targetDir = fileURLToPath(dir);
					const cwd = dirname(fileURLToPath(import.meta.url));
					const relativeDir = relative(cwd, targetDir);
					return new Promise((resolve) => {
						spawn("pnpm", ["dlx", "pagefind", "--site", relativeDir], {
							stdio: "inherit",
							shell: true,
							cwd,
						}).on("close", resolve);
					});
				},
			},
		},
	],
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
