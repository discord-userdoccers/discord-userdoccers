import Chevron from "@components/icons/Chevron";
import { CopyIcon } from "@components/mdx/icons/CopyIcon";
import { CheckmarkLargeIcon as TickIcon } from "@components/mdx/icons/CheckmarkLargeIcon";
import { Language, LANGUAGE_CONFIG } from "@lib/type-generator/languageConfig";
import { useCodegenLanguage, useToast } from "@lib/type-generator/store";
import React, { RefObject, useEffect, useRef, useState } from "react";

const cn = (...c: string[]) => c.join(" ");

function CopyBar(props: { tableRef: RefObject<HTMLTableElement> }) {
  const { showSuccessToast, showErrorToast } = useToast();
  const { selectedLanguage, setSelectedLanguage } = useCodegenLanguage();

  const [isDropdownOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showCopyIcon, setShowCopyIcon] = useState(false);

  useEffect(() => {
    if (showCopyIcon) {
      setTimeout(() => {
        setShowCopyIcon(false);
      }, 1000);
    }
  }, [showCopyIcon]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  function tryCopyCodeToClipboard() {
    const table = props.tableRef.current;
    const generator = LANGUAGE_CONFIG[selectedLanguage].generator;

    if (table) {
      const code: string = generator(table);
      (async () => {
        await navigator.clipboard
          .writeText(code)
          .catch((err) => {
            console.error(err);
            showErrorToast("Failed to copy code to clipboard. Check console for details.");
          })
          .then(() => {
            showSuccessToast("Copied code to clipboard.");
            setShowCopyIcon(true);
          });
      })();
    } else {
      showErrorToast("Failed to generate code for this table. Check console for details.");
      console.error(
        "Failed to generate code for this table.",
        "It could be that this table isn't showing an actual struct or enum.",
        "If this is supposed to work, open an issue on GitHub!",
      );
    }
  }

  const Icon = LANGUAGE_CONFIG[selectedLanguage].icon;

  return (
    <div className="opacity-transition relative flex flex-row-reverse items-center gap-1 opacity-0 duration-300 group-hover:opacity-100">
      {showCopyIcon && (
        <TickIcon
          className="my-auto h-5 w-5 cursor-pointer text-black select-none dark:text-white"
          onClick={() => tryCopyCodeToClipboard()}
        />
      )}
      {!showCopyIcon && (
        <CopyIcon
          className="my-auto h-5 w-5 cursor-pointer text-black select-none dark:text-white"
          onClick={() => tryCopyCodeToClipboard()}
        />
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className={cn(
            "text-text-light amoled:border amoled:border-gray-800 dark:text-text-dark flex cursor-pointer gap-1 rounded-md bg-white py-1 pr-1.5 pl-2 font-mono text-xs select-none dark:bg-black",
            "flex items-center gap-1",
          )}
          onClick={() => setIsOpen(!isDropdownOpen)}
          title="Select language to copy"
        >
          <Icon className="h-4" />
          <span>{selectedLanguage}</span>
          <Chevron className="h-4 w-3 text-black dark:text-white" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 z-10 mt-1 w-32 rounded-md shadow-lg">
            <div role="menu" aria-orientation="vertical">
              {Object.entries(LANGUAGE_CONFIG).map(([key, language], i, arr) => {
                const OptionIcon = language.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedLanguage(key as Language);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "text-text-light dark:text-text-dark block w-full cursor-pointer px-4 py-2 text-left font-mono text-xs select-none",
                      "flex items-center gap-2",
                      "dark:bg-theme-dark-sidebar bg-white",
                      "hover:bg-theme-light-sidebar-hover dark:hover:bg-theme-dark-sidebar-hover",
                      i === 0 ? "rounded-t-md" : i === arr.length - 1 ? "rounded-b-md" : "",
                    )}
                    role="menuitem"
                  >
                    <OptionIcon className="h-5" />
                    {language.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- needed to avoid react bug
export function Table({ ref: _, ...props }: React.JSX.IntrinsicElements["table"] & { useCodegen?: boolean }) {
  const tableRef = useRef<HTMLTableElement>(null);

  return (
    <div className="group relative mt-0 max-w-full overflow-auto">
      <table
        ref={tableRef}
        className="w-full border-collapse overflow-hidden rounded-md align-middle text-sm wrap-break-word"
        {...props}
      />
      {props.useCodegen !== false && (
        <div className="absolute top-0 right-0 p-2 px-2">
          <CopyBar tableRef={tableRef as React.RefObject<HTMLTableElement>} />
        </div>
      )}
    </div>
  );
}

export function TableHead(props: React.JSX.IntrinsicElements["thead"]) {
  return <thead className="dark:bord-white border-b-2 border-gray-300 text-left dark:border-black" {...props} />;
}

export function TableHeader(props: React.JSX.IntrinsicElements["th"]) {
  return <th className="dark:bg-table-head-background-dark bg-gray-200 p-2 px-3 uppercase" {...props} />;
}

export function TableRow(props: React.JSX.IntrinsicElements["tr"]) {
  return (
    <tr
      className="text-text-light amoled:bg-[#111]! even:amoled:bg-black! dark:text-text-dark bg-gray-100 even:bg-gray-50 dark:bg-zinc-800 dark:even:bg-zinc-900"
      {...props}
    />
  );
}

export function TableData(props: React.JSX.IntrinsicElements["td"]) {
  return <td className="max-w-xs p-2 px-3" {...props} />;
}
