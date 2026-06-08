import { SearchIcon } from "./mdx/icons/SearchIcon";
import { openSearch } from "./searchEvents";

// Lightweight trigger button: kept in a tiny standalone module so the
// heavyweight Searchbar dialog (with its result parsing logic) can stay
// lazy-loaded while the trigger itself ships in the eager nav bundle
export default function SearchTrigger() {
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
  return (
    <button
      type="button"
      onClick={() => openSearch()}
      onKeyDown={(e) => {
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          openSearch(e.key);
        }
      }}
      className="amoled:border amoled:border-[#333] amoled:bg-black flex w-full items-center gap-2 rounded-xl bg-[#f2f3f5] px-3 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:bg-[#323339] dark:text-gray-400 dark:hover:text-gray-200"
    >
      <SearchIcon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">Search docs...</span>
      <kbd className="border-brand-blurple/40 bg-brand-blurple/10 text-brand-blurple hidden rounded border px-1.5 py-0.5 text-xs font-medium sm:inline-block">
        {isMac ? "⌘" : "Ctrl+"}K
      </kbd>
    </button>
  );
}
