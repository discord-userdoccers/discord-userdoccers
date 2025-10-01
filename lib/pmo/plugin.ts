/**
 * Prototype Modelling Object
 */

import { Root } from "mdast";
import ts from "typescript";
import { visit } from "unist-util-visit";
import { error, Resolver } from "./resolve";
import { Serializer } from "./serializer";

const resolver = new Resolver();
const serializer = new Serializer();

function expandPMO(tree: Root) {
  visit(tree, (node, index, parent) => {
    if (node.type !== "code") return;
    if (node.meta != "pmo") return;

    if (["ts", "typescript"].indexOf(node.lang?.toLowerCase() ?? "") == -1) {
      throw error("has invalid language");
    }

    if (parent == null || index == null) {
      throw error("without a parent and/or index");
    }

    const ast = ts.createSourceFile("pmo.ts", node.value, ts.ScriptTarget.Latest);
    const resolved = resolver.resolve(ast.statements);

    const serialized = [];

    for (const model of resolved) {
      serialized.push(...serializer.serialize(model));
    }

    parent.children.splice(index, 1, ...serialized);

    // `- 1` because we are also deleting the original node
    // return a number because we don't want to visit these nodes
    return serialized.length - 1;
  });
}

export default function plugin() {
  return expandPMO;
}
