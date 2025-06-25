import { Root } from "mdast";
import { visit } from "unist-util-visit";

function stripFrontmatter(tree: Root) {
  // TODO: This is fucking terrible
  visit(tree, ["thematicBreak"], (_, index, parent) => {
    if (parent == null || index == null) return;

    // thematicBreak signifies the start of the frontmatter
    // We remove the frontmatter from the tree
    // by removing children until we see a heading
    while (parent.children[index].type !== "heading") {
      parent.children.splice(index, 1);
    }

    parent.children.splice(index, 1);
  });
}

export default function plugin() {
  return stripFrontmatter;
}
