import { Button } from "@headlessui/react";
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
  const [search, setSearch] = useState("");

  // Show loading indicator after 500ms -- only if request is taking a while
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ContentWrapper>
      <H1>Error Codes</H1>

      <Paragraph
        style={{
          paddingRight: !codes ? "1rem" : undefined,
        }}
      >
        Along with the HTTP error code, the Discord API can also return more detailed error codes through a{" "}
        <InlineCode>code</InlineCode> key in the JSON error response. The response will also contain a{" "}
        <InlineCode>message</InlineCode> key containing a more friendly error string. Some of these errors may include
        additional details in the form of <Anchor href="/reference#error-messages">Error Messages</Anchor> provided by
        an <InlineCode>errors</InlineCode> object.
      </Paragraph>

      <Paragraph
        style={{
          paddingRight: !codes ? "1rem" : undefined,
        }}
      >
        We maintain an unofficial updated list of error codes seen in the wild, which is significantly more
        comprehensive than the official documentation. You can find the gist that contains this list on{" "}
        <Anchor href="https://gist.github.com/Dziurwa14/de2498e5ee28d2089f095aa037957cbb/">GitHub</Anchor>. If you found
        an error which is not listed, you can submit it here with reproduction steps and we will add it to the list.
        Thanks for your contribution!
      </Paragraph>

      <div className="flex justify-start">
        <button
          className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-md/80 bg-brand-blurple font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white hover:bg-brand-blurple/90 data-open:bg-gray-700"
          onClick={() => {}}
        >
          Submit Error
        </button>

        {/* this searchbar is very laggy, any fix? -- maybe debounce */}
        <input
          type="text"
          placeholder="Search error codes..."
          // FIXME(splatter): This is disgusting styling
          className="DocSearch DocSearch-Button py-3.5 px-4 h-full min-w-96 rounded-md dark:bg-table-row-background-secondary-dark focus:outline-none focus:ring-2 focus:ring-brand-blurple"
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
      </div>

      {!codes && !error && showLoading ? <p className="italic">Loading...</p> : null}
      {error ? <p className="italic">{error.message}</p> : null}
      {codes
        ? codes.map(({ name, codes, index }) => (
            <ErrorCodeGroup key={name} name={name} codes={codes} index={index} search={search} />
          ))
        : null}
    </ContentWrapper>
  );
}
