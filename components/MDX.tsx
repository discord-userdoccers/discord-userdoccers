import { MDXProvider } from "@mdx-js/react";
import ContentWrapper from "./mdx/ContentWrapper";
import Heading from "./mdx/Heading";
import Code from "./mdx/Code";

function InlineCode(props: any) {
  return <code {...props} />;
}

const COMPONENTS = {
  wrapper: (props: any) => <ContentWrapper {...props} />,
  h1: ({children}: any) => <Heading as="h1">{children}</Heading>,
  h2: ({children}: any) => <Heading as="h2">{children}</Heading>,
  h3: ({children}: any) => <Heading as="h3">{children}</Heading>,
  h4: ({children}: any) => <Heading as="h4">{children}</Heading>,
  h5: ({children}: any) => <Heading as="h5">{children}</Heading>,
  h6: ({children}: any) => <Heading as="h6">{children}</Heading>,
  code: Code,
  inlineCode: InlineCode,
};

interface MDXProps {
  children: React.ReactNode;
}

export default function MDX ({ children }: MDXProps) {
  return <MDXProvider components={COMPONENTS}>{children}</MDXProvider>;
}
