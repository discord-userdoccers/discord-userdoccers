import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchIcon } from "./mdx/icons/SearchIcon";
import classNames from "@lib/classnames";
import MenuContext from "../contexts/MenuContext";
import { registerOpenSearch } from "./searchEvents";

const DEBOUNCE_MS = 100;

interface SearchResult {
  title: string;
  section: string;
  path: string;
  anchor: string;
  content: string;
  score: number;
}

interface SnippetPart {
  type: "text" | "table";
  text?: string;
  rows?: string[][];
}

function cleanText(text: string): string {
  return text.replace(/[ \t]{2,}/g, " ").trim();
}

// Remove MDX backslash escapes before punctuation/special chars (e.g. "1 \<\< 0" -> "1 << 0")
function unescapeMdx(text: string): string {
  return text.replace(/\\([\\`*_{}\[\]()#+\-.!<>|~])/g, "$1");
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Render ^1^ footnote markers as <sup>, and ~~text~~ strikethroughs as <s>
  const nodes: React.ReactNode[] = [];
  const regex = /(\^\d+\^)|~~([^~]+)~~/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      const digit = match[1].slice(1, -1);
      nodes.push(
        <sup key={`${keyPrefix}-${i++}`} className="text-[9px] opacity-60">
          {digit}
        </sup>,
      );
    } else if (match[2]) {
      nodes.push(
        <s key={`${keyPrefix}-${i++}`} className="opacity-60">
          {match[2]}
        </s>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderWithStyling(text: string): React.ReactNode[] {
  return renderInline(unescapeMdx(text), "f");
}

function parseSnippet(content: string): SnippetPart[] {
  const parts: SnippetPart[] = [];
  let currentRows: string[][] = [];
  let textBuf = "";

  const flushText = () => {
    const cleaned = cleanText(textBuf).replace(/\n{2,}/g, "\n");
    if (cleaned) parts.push({ type: "text", text: cleaned });
    textBuf = "";
  };

  const flushTable = () => {
    if (currentRows.length > 0) {
      parts.push({ type: "table", rows: currentRows });
      currentRows = [];
    }
  };

  for (const line of content.split("\n")) {
    if (line.startsWith("\x00")) {
      // Table row (NUL prefix + tab-separated cells)
      if (textBuf) flushText();
      currentRows.push(line.slice(1).split("\t"));
    } else {
      if (currentRows.length) flushTable();
      textBuf += (textBuf ? "\n" : "") + line;
    }
  }
  if (textBuf) flushText();
  if (currentRows.length) flushTable();

  return parts;
}

function MiniTable({ rows, isSelected }: { rows: string[][]; isSelected: boolean }) {
  const header = rows[0];
  const body = rows.slice(1, 4); // Show max 3 data rows
  const hasMore = rows.length > 4;

  return (
    <div className="mt-1 overflow-hidden rounded border border-current/10 text-[11px] leading-tight">
      {header && (
        <div
          className={classNames("flex gap-px font-medium", {
            "bg-white/15": isSelected,
            "bg-gray-100 dark:bg-white/5": !isSelected,
          })}
        >
          {header.map((cell, j) => (
            <span key={j} className="flex-1 truncate px-1.5 py-0.5">
              {renderWithStyling(cell)}
            </span>
          ))}
        </div>
      )}
      {body.map((row, i) => (
        <div
          key={i}
          className={classNames("flex gap-px", {
            "bg-white/5": isSelected,
            "bg-transparent": !isSelected,
          })}
        >
          {row.map((cell, j) => (
            <span key={j} className="flex-1 truncate px-1.5 py-0.5 opacity-80">
              {renderWithStyling(cell)}
            </span>
          ))}
        </div>
      ))}
      {hasMore && <div className="px-1.5 py-0.5 text-center opacity-50">+{rows.length - 4} more rows</div>}
    </div>
  );
}

export default function Searchbar() {
  const location = useLocation();
  const { setClose: closeMenu } = useContext(MenuContext);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Register this instance as the ctrl+k open target
  useEffect(() => {
    registerOpenSearch((seed?: string) => {
      closeMenu();
      if (seed) setQuery(seed);
      setOpen(true);
    });
  }, [closeMenu]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
          setError(null);
        } else {
          setError("Search unavailable");
          setResults([]);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("Search unavailable");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  // Reset selection when results change
  useEffect(() => setSelected(0), [results]);

  // Scroll selected result into view
  useEffect(() => {
    const el = resultsRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  // Reactively close the modal whenever the route changes
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.hash]);

  const go = useCallback(
    (result: SearchResult) => {
      const samePage = location.pathname === result.path;
      const url = result.anchor ? `${result.path}#${result.anchor}` : result.path;

      if (samePage) {
        close();
        if (result.anchor) {
          const el = document.getElementById(result.anchor);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            history.replaceState(null, "", `#${result.anchor}`);
          }
        }
      } else {
        navigate(url);
        if (result.anchor) {
          let attempts = 0;
          const tryScroll = () => {
            const el = document.getElementById(result.anchor);
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            } else if (attempts++ < 30) {
              setTimeout(tryScroll, 100);
            }
          };
          setTimeout(tryScroll, 150);
        }
      }
    },
    [navigate, location.pathname, close],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelected((i) => Math.min(i + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelected((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selected]) go(results[selected]);
          break;
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "k":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
            close();
          }
          break;
      }
    },
    [results, selected, go, close],
  );

  return (
    <>
      {/* Search dialog */}
      <Dialog open={open} onClose={close} className="relative z-50">
        {/* Backdrop: only on xl+ (desktop modal). Hidden on mobile full-screen view. */}
        <DialogBackdrop
          transition
          className="fixed inset-0 hidden bg-black/50 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150 xl:block"
        />

        {/* Mobile (< xl): fixed full-screen page. Desktop (xl+): centered modal. */}
        <div className="fixed inset-0 xl:flex xl:items-start xl:justify-center xl:px-4 xl:pt-[15vh]">
          <DialogPanel
            transition
            className="dark:bg-background-dark amoled:bg-black amoled:xl:ring-[#333] flex h-dvh w-full flex-col overflow-hidden bg-white xl:h-auto xl:max-w-xl xl:rounded-2xl xl:shadow-2xl xl:ring-1 xl:ring-black/5 xl:transition-all xl:data-closed:scale-95 xl:data-closed:opacity-0 xl:data-enter:duration-200 xl:data-leave:duration-150 dark:xl:ring-white/10"
          >
            {/* Header row: back arrow on mobile, search icon on xl+ */}
            <div className="flex items-center gap-2 border-b border-gray-200 px-3 xl:gap-3 xl:px-4 dark:border-gray-700">
              {/* Back button: mobile only */}
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded p-1 text-gray-500 xl:hidden dark:text-gray-400"
                aria-label="Close search"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              {/* Search icon: xl+ only */}
              <SearchIcon className="hidden h-5 w-5 shrink-0 text-gray-400 xl:block dark:text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search documentation..."
                className="h-14 flex-1 border-0 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 xl:h-12 xl:text-sm dark:text-gray-100 dark:placeholder:text-gray-500"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Results */}
            <div ref={resultsRef} className="flex-1 overflow-y-auto p-2 xl:max-h-[60vh] xl:flex-initial">
              {loading && query && (
                <div className="flex items-center justify-center py-8 text-sm text-gray-400 dark:text-gray-500">
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching...
                </div>
              )}

              {error && !loading && (
                <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">{error}</div>
              )}

              {!loading && !error && query && results.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No results found</div>
              )}

              {!loading &&
                results.map((result, i) => {
                  const parts = parseSnippet(result.content);
                  const isSelected = i === selected;
                  return (
                    <button
                      key={`${result.path}${result.anchor}`}
                      type="button"
                      onClick={() => go(result)}
                      onMouseEnter={() => setSelected(i)}
                      className={classNames(
                        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        {
                          "bg-brand-blurple text-white": isSelected,
                          "text-gray-700 dark:text-gray-300": !isSelected,
                        },
                      )}
                    >
                      <SearchIcon
                        className={classNames("mt-0.5 h-4 w-4 shrink-0", {
                          "text-white/60": isSelected,
                          "text-gray-400 dark:text-gray-500": !isSelected,
                        })}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium opacity-70">
                          <span>{result.title}</span>
                          {result.section !== result.title && (
                            <>
                              <span className="opacity-50">›</span>
                              <span className="truncate">{result.section}</span>
                            </>
                          )}
                        </div>
                        {parts.map((part, j) =>
                          part.type === "table" ? (
                            <MiniTable key={j} rows={part.rows!} isSelected={isSelected} />
                          ) : (
                            <p key={j} className="mt-0.5 line-clamp-2 text-sm leading-snug opacity-90">
                              {renderWithStyling(part.text!.slice(0, 150))}
                              {part.text!.length > 150 ? "…" : ""}
                            </p>
                          ),
                        )}
                      </div>
                    </button>
                  );
                })}

              {!query && !loading && (
                <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  Type to search the documentation
                </div>
              )}
            </div>

            {/* Footer with keyboard hints: desktop only */}
            <div className="hidden items-center gap-4 border-t border-gray-200 px-4 py-2 text-xs text-gray-400 xl:flex dark:border-gray-700 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 px-1 py-0.5 font-mono dark:border-gray-600">↑</kbd>
                <kbd className="rounded border border-gray-300 px-1 py-0.5 font-mono dark:border-gray-600">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 px-1 py-0.5 font-mono dark:border-gray-600">↵</kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 px-1 py-0.5 font-mono dark:border-gray-600">esc</kbd>
                close
              </span>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
