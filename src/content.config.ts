import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const collections = {
	docs: defineCollection({
		loader: glob({
			pattern: "**/*",
			base: "./docs",
		}),
		schema: z.object({}),
	}),
};
