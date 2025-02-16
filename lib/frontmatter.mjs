import { visit } from 'unist-util-visit';

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
const stripFrontmatter = () => {
  return (tree) => {
    visit(tree, 'yaml', (node, index, parent) => {
      if (parent && typeof index === 'number') {
        parent.children.splice(index, 1);
      }
    });
  };
};

export default stripFrontmatter;
