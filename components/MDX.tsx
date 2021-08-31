import { MDXProvider } from "@mdx-js/react";
import ContentWrapper from "./mdx/ContentWrapper";
import Heading from "./mdx/Heading";
import Code from "./mdx/Code";

function InlineCode(props) {
  return <code {...props} />;
}

const COMPONENTS = {
  wrapper: (props) => <ContentWrapper {...props} />,
  h1: (props) => <Heading as="h1" {...props} />,
  h2: (props) => <Heading as="h2" {...props} />,
  h3: (props) => <Heading as="h3" {...props} />,
  h4: (props) => <Heading as="h4" {...props} />,
  h5: (props) => <Heading as="h5" {...props} />,
  h6: (props) => <Heading as="h6" {...props} />,
  code: Code,
  inlineCode: InlineCode,
};

export default function MDX({ children }) {
  return <MDXProvider components={COMPONENTS}>{children}</MDXProvider>;
}
