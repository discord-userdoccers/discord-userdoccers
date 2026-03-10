import React from "react";

export default function InlineCode(props: React.JSX.IntrinsicElements["code"]) {
  return (
    <code
      className="bg-theme-light-sidebar py-teensy amoled:bg-zinc-900! dark:bg-table-row-background-secondary-dark rounded-md px-2 text-sm"
      {...props}
    />
  );
}
