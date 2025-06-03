import { MDXProvider } from "@mdx-js/react";
import Image from "next/legacy/image";
import React from "react";
import Alert from "./Alert";
import RouteHeader from "./RouteHeader";
import Anchor from "./mdx/Anchor";
import Code from "./mdx/Code";
import Collapsible from "./mdx/Collapsible";
import ContentWrapper from "./mdx/ContentWrapper";
import Emphasis from "./mdx/Emphasis";
import { H1, H2, H3, H4, H5, H6 } from "./mdx/Heading";
import HorizontalRule from "./mdx/HorizontalRule";
import InlineCode from "./mdx/InlineCode";
import { ListItem, OrderedList, UnorderedList } from "./mdx/List";
import Paragraph from "./mdx/Paragraph";
import StrikeThrough from "./mdx/StrikeThrough";
import Strong from "./mdx/Strong";
import { Table, TableData, TableHead, TableHeader, TableRow } from "./mdx/Table";
import MDX_ICONS from "./mdx/icons";

const COMPONENTS = {
  wrapper: (props: React.ComponentProps<typeof ContentWrapper>) => <ContentWrapper {...props} />,
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

  // Custom components
  Image,
  Alert,
  RouteHeader,
  Collapsible,

  // icons
  ...MDX_ICONS,
};

interface MDXProps {
  children: React.ReactNode;
}

export default function MDX({ children }: MDXProps) {
  return <MDXProvider components={COMPONENTS}>{children}</MDXProvider>;
}
