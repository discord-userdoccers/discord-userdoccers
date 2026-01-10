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

        <div className={Styles.controls}>
          <div className="relative flex-1">
            <SearchIcon className={Styles.controlsIcon} />
            <input
              className={Styles.searchbar}
              type="search"
              name="search"
              placeholder="Search error codes..."
              onChange={(e) => setSearch(e.target.value.toLowerCase())}
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsDialogOpen(true)} className={Styles.submitButton}>
              Submit Error
            </button>

            <label className={Styles.filterLabel}>
              <span>Filter Unknown</span>
              <div className="relative">
                <input
                  type="checkbox"
                  name="filterUnknown"
                  className="peer sr-only"
                  checked={filterByUnknown}
                  onChange={(e) => setFilterByUnknown(e.target.checked)}
                />
                <div
                  className={
                    Styles.filterToggle1 +
                    " peer-checked:bg-brand-blurple peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blurple/50"
                  }
                ></div>
                <div className={Styles.filterToggle2 + " peer-checked:translate-x-5"}></div>
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
