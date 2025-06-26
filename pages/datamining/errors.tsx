import { useEffect, useState } from "react";
import useSWR from "swr";
import ErrorCodeGroup from "../../components/ErrorCodeGroup";
import Anchor from "../../components/mdx/Anchor";
import ContentWrapper from "../../components/mdx/ContentWrapper";
import { H1, H3 } from "../../components/mdx/Heading";
import InlineCode from "../../components/mdx/InlineCode";
import Paragraph from "../../components/mdx/Paragraph";
import { Table, TableData, TableHead, TableHeader, TableRow } from "../../components/mdx/Table";

export default function Errors() {
  const { data: codes, error } = useSWR<{ name: string; codes: Record<string, string>; index: number }[]>(
    "/api/codes",
    (url: string) => fetch(url).then((res) => res.json()),
  );

  const [showLoading, setShowLoading] = useState(false);

  // Show loading indicator after 500ms -- only if request is taking a while
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ContentWrapper>
      <H1>Error Codes</H1>

      <Paragraph className={!codes ? "pr-3" : ""}>
        Along with the HTTP error code, the Discord API can also return more detailed error codes through a{" "}
        <InlineCode>code</InlineCode> key in the JSON error response. The response will also contain a{" "}
        <InlineCode>message</InlineCode> key containing a more friendly error string. Some of these errors may include
        additional details in the form of <Anchor href="/reference#error-messages">Error Messages</Anchor> provided by
        an <InlineCode>errors</InlineCode> object.
      </Paragraph>

      {!codes && !error && showLoading ? <p className="italic">Loading...</p> : null}
      {error ? <p className="italic">{error.message}</p> : null}
      {codes
        ? codes.map(({ name, codes, index }) => <ErrorCodeGroup key={name} name={name} codes={codes} index={index} />)
        : null}
    </ContentWrapper>
  );
}
