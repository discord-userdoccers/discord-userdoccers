import { MDXProvider } from "@mdx-js/react";
import ContentWrapper from "./mdx/ContentWrapper";
import Heading from "./mdx/Heading";
import Code from "./mdx/Code";

function InlineCode(props: any) {
  return <code {...props} />;
}

type HeadingProps = { children: React.ReactNode };

const COMPONENTS = {
  wrapper: (props: any) => <ContentWrapper {...props} />,
  h1: ({children}: HeadingProps) => <Heading as="h1">{children}</Heading>,
  h2: ({children}: HeadingProps) => <Heading as="h2">{children}</Heading>,
  h3: ({children}: HeadingProps) => <Heading as="h3">{children}</Heading>,
  h4: ({children}: HeadingProps) => <Heading as="h4">{children}</Heading>,
  h5: ({children}: HeadingProps) => <Heading as="h5">{children}</Heading>,
  h6: ({children}: HeadingProps) => <Heading as="h6">{children}</Heading>,
  code: Code,
  inlineCode: InlineCode,
};

interface MDXProps {
  children: React.ReactNode;
}

export default function MDX ({ children }: MDXProps) {
  return <MDXProvider components={COMPONENTS}>{children}</MDXProvider>;
}
