import { MDXProvider } from "@mdx-js/react";
import ContentWrapper from "./mdx/ContentWrapper";
import Heading from "./mdx/Heading";
import Code from "./mdx/Code";

const InlineCode: React.FC<{}> = (props) => {
  return <code {...props} />;
}

type HeadingProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;

const COMPONENTS = {
  wrapper: (props: any) => <ContentWrapper {...props} />,
  h1: (props: HeadingProps) => <Heading as="h1" {...props} />,
  h2: (props: HeadingProps) => <Heading as="h2" {...props} />,
  h3: (props: HeadingProps) => <Heading as="h3" {...props} />,
  h4: (props: HeadingProps) => <Heading as="h4" {...props} />,
  h5: (props: HeadingProps) => <Heading as="h5" {...props} />,
  h6: (props: HeadingProps) => <Heading as="h6" {...props} />,
  code: Code,
  inlineCode: InlineCode,
};

const MDX: React.FC<{}> = ({ children }) => {
  return <MDXProvider components={COMPONENTS}>{children}</MDXProvider>;
}

export default MDX;