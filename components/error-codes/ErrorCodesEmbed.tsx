import { useEffect, useState } from "react";
import { HashProvider } from "../../hooks/useHash";
import Styles from "../../stylesheets/modules/Errors.module.css";
import ErrorCodeGroup from "./ErrorCodeGroups";
import { SubmitErrorDialog } from "./ErrorSubmitDialog";
import { SearchIcon } from "../mdx/icons/SearchIcon";

export interface ErrorGroup {
  name: string;
  index: number;
  codes: Record<string, string>;
}

export default function ErrorCodesEmbed() {
  const [codes, setCodes] = useState<ErrorGroup[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const url = import.meta.env.VITE_ERROR_CODES_ENDPOINT;
    if (!url) return;
    fetch(url)
      .then((res) => (res.ok ? res.json() : res.text().then((t) => Promise.reject(new Error(`Server Error: ${t}`)))))
      .then((data: ErrorGroup[]) => setCodes(data))
      .catch((e: Error) => setError(e));
  }, []);

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
    <>
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
                  " peer-checked:bg-brand-blurple peer-focus:ring-brand-blurple/50 peer-focus:ring-2 peer-focus:outline-hidden"
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
    </>
  );
}
