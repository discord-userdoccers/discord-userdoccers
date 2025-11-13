import React from "react";

export default function InlineCode(props: React.JSX.IntrinsicElements["code"]) {
  return (
    <code
      className="rounded-md bg-theme-light-sidebar px-2 py-teensy text-sm dark:bg-table-row-background-secondary-dark"
      {...props}
    />
  );
}
