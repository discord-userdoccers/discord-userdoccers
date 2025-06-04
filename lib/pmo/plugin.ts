/**
 * Prototype Modelling Object
 */

import { Root } from "mdast";
import ts from "typescript";
import { visit } from "unist-util-visit";
import { Resolver } from "./resolve";

// this actually persists throughout pages
// idk why you need to know this but it might be useful in future
const resolver = new Resolver();

function expandPMO(tree: Root) {
  visit(tree, (node, index, parent) => {
    if (node.type !== "code") return;
    if (node.meta != "pmo") return;

    if (["ts", "typescript"].indexOf(node.lang?.toLowerCase() ?? "") == -1) {
      throw new Error("⚠ found a pmo node with invalid language");
    }

    if (parent == null || index == null) {
      throw new Error("⚠ found a pmo node without a parent and/or index");
    }

    const ast = ts.createSourceFile("pmo.ts", node.value, ts.ScriptTarget.Latest);
    const resolved = resolver.resolve(ast.statements);

    parent.children.splice(index, 1, ...resolved);

    // `- 1` because we are also deleting the original node
    // return a number because we don't want to visit these nodes
    return resolved.length - 1;
  });
}

export default function plugin() {
  return expandPMO;
}
