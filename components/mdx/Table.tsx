import React, { RefObject, useEffect, useRef, useState } from "react";
import { PythonGenerator } from "../../lib/type-generator/python";
import { useCodegenLanguage, useToast } from "../../lib/type-generator/store";
import { TypescriptGenerator } from "../../lib/type-generator/typescript";

import Chevron from "../icons/Chevron";
import CopyIcon from "../icons/Copy";
import Python from "../icons/Python";
import TypeScript from "../icons/TypeScript";

const cn = (...c: string[]) => c.join(" ");

function CopyBar(props: { tableRef: RefObject<HTMLTableElement> }) {
  const { showSuccessToast, showErrorToast } = useToast();
  const { selectedLanguage, setSelectedLanguage } = useCodegenLanguage();

  const [isDropdownOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef])

  function tryCopyCodeToClipboard() {
    if (!props.tableRef.current) return;

    let code;

    if (selectedLanguage === "Python") {
      code = PythonGenerator.parseDOM(props.tableRef.current);

    }

    if (selectedLanguage === "TypeScript") {
      code = TypescriptGenerator.parseDOM(props.tableRef.current);
    }

    if (code) {

      (async () => {
        await navigator.clipboard.writeText(code)
          .catch((err) => {
            console.error(err);
            showErrorToast("Failed to copy code to clipboard. Check console for details.");
          })
          .then(() => {
            showSuccessToast("Copied code to clipboard.");
          });
      })();

    } else {
      showErrorToast("Failed to generate code for this table. Check console for details.");
      console.error(
        "Failed to generate code for this table.",
        "It could be that this table isn't showing an actual struct or enum.",
        "If this is supposed to work, open an issue on GitHub!"
      );
    }
  }

  return (
    <div className="relative flex flex-row-reverse items-center gap-1">
      <CopyIcon className="h-5 w-5 my-auto cursor-pointer select-none" onClick={() => tryCopyCodeToClipboard()} />

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className={cn(
            "pl-2 pr-1.5 py-1 rounded-md text-xs font-mono bg-white dark:bg-black text-text-light dark:text-text-dark cursor-pointer select-none flex gap-1",
            "flex items-center gap-1",
          )}
          onClick={() => setIsOpen(!isDropdownOpen)}
          title="Select language to copy"
        >
          {selectedLanguage === "Python" && <Python className="h-4" />}
          {selectedLanguage === "TypeScript" && <TypeScript className="h-4" />}

          <span>{selectedLanguage}</span>

          <Chevron className="text-white w-3 h-4" />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-1 w-32 rounded-md shadow-lg z-10 ">
            <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu-button">
              <button
                onClick={() => { setSelectedLanguage("Python"); setIsOpen(false); }}
                className={cn(
                  'block w-full text-left px-4 py-2 text-xs font-mono cursor-pointer select-none rounded-t-md',
                  'flex items-center gap-2',
                  'bg-theme-light-sidebar dark:bg-theme-dark-sidebar',
                  'hover:bg-theme-light-sidebar-hover dark:hover:bg-theme-dark-sidebar-hover'
                )}
                role="menuitem"
              >
                <Python className="h-5" />
                Python
              </button>
              <button
                onClick={() => { setSelectedLanguage("TypeScript"); setIsOpen(false); }}
                className={cn(
                  'block w-full text-left px-4 py-2 text-xs font-mono cursor-pointer select-none rounded-b-md',
                  'flex items-center gap-2',
                  'bg-theme-light-sidebar dark:bg-theme-dark-sidebar',
                  'hover:bg-theme-light-sidebar-hover dark:hover:bg-theme-dark-sidebar-hover'
                )}
                role="menuitem"
              >
                <TypeScript className="h-5" />
                TypeScript
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Table(props: JSX.IntrinsicElements["table"]) {
  const tableRef = useRef<HTMLTableElement>(null);

  return (
    <div className="max-w-full overflow-auto mt-0 relative max-w-full">
      <table ref={tableRef}
        className="w-full border-collapse overflow-hidden break-words rounded-md rounded-t-none align-middle text-sm"
        {...props}
      />
      <div className="absolute top-0 right-0 px-2 p-2">
        <CopyBar tableRef={tableRef} />
      </div>
    </div>
  );
}

export function TableHead(props: JSX.IntrinsicElements["thead"]) {
  return <thead className="dark:bord-white border-b-2 border-gray-300 text-left dark:border-black" {...props} />;
}

export function TableHeader(props: JSX.IntrinsicElements["th"]) {
  return <th className="bg-gray-200 p-2 px-3 uppercase dark:bg-table-head-background-dark" {...props} />;
}

export function TableRow(props: JSX.IntrinsicElements["tr"]) {
  return (
    <tr
      className="bg-gray-100 text-text-light even:bg-gray-50 dark:bg-trueGray-800 dark:text-text-dark dark:even:bg-trueGray-900"
      {...props}
    />
  );
}

export function TableData(props: JSX.IntrinsicElements["td"]) {
  return <td className="max-w-xs p-2 px-3" {...props} />;
}
