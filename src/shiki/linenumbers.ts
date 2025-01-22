import type { ShikiTransformer } from "@shikijs/core";
import type { MetaNode } from "./diffnotation";

export function shikiLineNumbers(classToAdd = "line-numbers"): ShikiTransformer {
	return {
		name: "shiki-linenumbers",
		code(node: MetaNode) {
			if (node.meta?.lines) this.addClassToHast(this.pre, classToAdd);
		},
	};
}
