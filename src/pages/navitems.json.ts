import type { APIRoute } from "astro";
import { getCollection, render } from "astro:content";

export type output = Record<string, [string, string, number][]>;

const entries = (await getCollection("docs")).filter((e) => e.id !== "intro");
const rendered = await Promise.all(entries.map(render));

const output: output = {};
for (let i = 0; i < entries.length; i++) {
	const e = entries[i],
		{ headings } = rendered[i];
	output[e.id] = headings.map((h) => [h.slug, h.text, h.depth]);
}

export const GET: APIRoute = () => {
	return new Response(JSON.stringify(output));
};
