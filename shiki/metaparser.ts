// "inspired" by https://github.com/shiro/blog licensed under MIT, thanks a lot

import type { ShikiTransformer } from "@shikijs/core";

export function shikiMetaParser(): ShikiTransformer {
	let meta = {};

	return {
		preprocess(_, options: any) {
			meta = {};
			const rawMeta: string = options.meta?.__raw;
			if (!rawMeta) return;
			meta = Object.fromEntries(
				rawMeta.split(" ").map((s) => {
					const parts = s.split("=").map((s) => s.trim());
					return [[parts[0]], parts[1] ? JSON.parse(parts[1]) : true];
				}),
			);
		},
		code(node: any) {
			node.properties = { ...node.properties, ...meta };
			node.meta = meta;
		},
	};
}
