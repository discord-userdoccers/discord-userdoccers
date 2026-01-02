import { useEffect, useState } from "react";
import useSWR from "swr";
import ErrorCodeGroup from "../../components/error-codes/ErrorCodeGroups";
import { SubmitErrorDialog } from "../../components/error-codes/ErrorSubmitDialog";
import Anchor from "../../components/mdx/Anchor";
import ContentWrapper from "../../components/mdx/ContentWrapper";
import { H1 } from "../../components/mdx/Heading";
import { SearchIcon } from "../../components/mdx/icons/SearchIcon";
import InlineCode from "../../components/mdx/InlineCode";
import Paragraph from "../../components/mdx/Paragraph";
import { HashProvider } from "../../hooks/useHash";
import Styles from "../../stylesheets/modules/Errors.module.css";

export interface ErrorGroup {
  name: string;
  index: number;
  codes: Record<string, string>;
}

export default function Errors() {
  const { data: codes, error } = useSWR<ErrorGroup[]>("/api/codes", (url: string) =>
    fetch(url).then((res): Promise<ErrorGroup[]> => {
      if (res.ok) {
        return res.json();
      }
      return res.text().then((text) => Promise.reject(new Error(`Server Error: ${text}`)));
    }),
  );

  const [showLoading, setShowLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterByUnknown, setFilterByUnknown] = useState(false);

  // Show loading indicator after 500ms -- only if request is taking a while
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <ContentWrapper>
      <div className="min-h-screen w-full">
        <H1>Error Codes</H1>

        <Paragraph>
          Along with the HTTP error code, the Discord API can also return more detailed error codes through a{" "}
          <InlineCode>code</InlineCode> key in the JSON error response. The response will also contain a{" "}
          <InlineCode>message</InlineCode> key containing a more friendly error string. Some of these errors may include
          additional details in the form of <Anchor href="/reference#error-messages">Error Messages</Anchor> provided by
          an <InlineCode>errors</InlineCode> object.
        </Paragraph>

        <Paragraph>
          We maintain an unofficial updated list of error codes seen in the wild, which is significantly more
          comprehensive than the official documentation. If you found an error which is incorrect or not listed, you can
          submit it here with reproduction steps, and we will add it to the list. Thanks for your contribution!
        </Paragraph>

        <SubmitErrorDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} codes={codes ?? []} />

        <div className="sticky top-0 z-10 mb-8 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white/80 p-4 backdrop-blur-md dark:border-gray-800 dark:bg-[#0b0c0f]/80 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search error codes..."
              className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-gray-200 dark:border-gray-700 dark:focus:border-gray-700"
              onChange={(e) => setSearch(e.target.value.toLowerCase())}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="rounded-lg bg-brand-blurple px-4 py-2 text-sm text-white transition-colors hover:bg-brand-blurple/90"
            >
              Submit Error
            </button>

            <label className="flex cursor-pointer select-none items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Unknown</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={filterByUnknown}
                  onChange={(e) => setFilterByUnknown(e.target.checked)}
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-brand-blurple peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blurple/50 dark:bg-gray-700"></div>
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>
        </div>

        {!codes && !error ? (
          <p
            className={Styles.statusText}
            aria-busy
            role="status"
            aria-live="polite"
            style={{
              visibility: showLoading ? "visible" : "hidden",
            }}
          >
            Loading...
          </p>
        ) : null}
        {error ? (
          <p className={Styles.statusText} role="alert">
            {error.message}
          </p>
        ) : null}
        <HashProvider>
          {codes
            ? codes.map(({ name, codes, index }) => (
                <ErrorCodeGroup
                  key={name}
                  name={name}
                  codes={codes}
                  index={index}
                  search={search}
                  unknownOnly={filterByUnknown}
                />
              ))
            : null}
        </HashProvider>
      </div>
    </ContentWrapper>
  );
}

Errors.meta = {
  title: "Error Codes",
  description:
    "We maintain an unofficial updated list of error codes seen in the wild, which is significantly more comprehensive than Discord's official documentation. If you found an error which is not listed, you can submit it here with reproduction steps and we will add it to the list.",
};
