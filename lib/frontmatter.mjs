import { visit } from 'unist-util-visit';

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
const stripFrontmatter = () => {
  return (tree) => {
    // TODO: This is fucking terrible
    visit(tree, ['thematicBreak'], (node, index, parent) => {
        // thematicBreak signifies the start of the frontmatter
        // We remove the frontmatter from the tree
        // by removing children until we see a heading
        while (parent.children[index].type !== 'heading') {
            parent.children.splice(index, 1);
        }
        parent.children.splice(index, 1);
    });
  };
};

export default stripFrontmatter;
