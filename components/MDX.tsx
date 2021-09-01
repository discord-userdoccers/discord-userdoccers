import { MDXProvider } from "@mdx-js/react";
import ContentWrapper from "./mdx/ContentWrapper";
import { H1, H2, H3, H4, H5, H6 } from "./mdx/Heading";
import Code from "./mdx/Code";
import Paragraph from "./mdx/Paragraph";
import { ListItem, OrderedList, UnorderedList } from "./mdx/List";
import {
  Table,
  TableHead,
  TableData,
  TableHeader,
  TableRow,
} from "./mdx/Table";
import Strong from "./mdx/Strong";
import Emphasis from "./mdx/Emphasis";
import StrikeThrough from "./mdx/StrikeThrough";
import HorizontalRule from "./mdx/HorizontalRule";
import Anchor from "./mdx/Anchor";
import Image from "./mdx/Image";
import InlineCode from "./mdx/InlineCode";

const COMPONENTS = {
  wrapper: (props: any) => <ContentWrapper {...props} />,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: Paragraph,
  code: Code,
  inlineCode: InlineCode,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  table: Table,
  thead: TableHead,
  th: TableHeader,
  tr: TableRow,
  td: TableData,
  em: Emphasis,
  strong: Strong,
  delete: StrikeThrough,
  hr: HorizontalRule,
  a: Anchor,
  img: Image,
};

interface MDXProps {
  children: React.ReactNode;
}

export default function MDX({ children }: MDXProps) {
  return <MDXProvider components={COMPONENTS}>{children}</MDXProvider>;
}
