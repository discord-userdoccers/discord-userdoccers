import { createElement, PropsWithChildren, ReactNode, useMemo, useState } from "react";
import Chevron from "../icons/Chevron";
import MDX_ICONS from "./icons";
import Paragraph from "./Paragraph";

interface CollapsibleProps {
  icon?: Exclude<React.ReactNode, string> | keyof typeof MDX_ICONS;
  title: string;
  description: string;
}

export default function Collapsible({
  children: originalChildren,
  icon: originalIcon,
  title,
  description,
}: PropsWithChildren<CollapsibleProps>) {
  // sometimes the first element in children is a string but the rest are <p> elements
  //
  // only if the element is called like this:
  // <Collapsible ...>
  //   some text <-- LITERAL STRING
  //
  //   some other text <-- <P> ELEMENT
  // </Collapsible>
  //
  // it's probably incorrect usage in MDX standard but we handle it here anyway
  const children = Array.isArray(originalChildren) ? Array.from(originalChildren) : [originalChildren];
  if (typeof children[0] === "string") {
    children[0] = <Paragraph>{children[0]}</Paragraph>;
  }

  // convert `warning-icon` and `warning` to `WarningIcon`
  const possibleKey = useMemo(() => {
    if (typeof originalIcon !== "string") return;

    // uses regex to uppercase the first character and any characters with - before it
    const replaced = originalIcon
      .toLowerCase()
      .replace(
        /^(\w)|-(\w)/g,
        (_, a: string | undefined, b: string | undefined) => a?.toUpperCase() ?? b!.toUpperCase(),
      );

    // allow users to specify `-icon` if they want
    if (replaced.endsWith("Icon")) return replaced;
    return `${replaced}Icon`;
  }, [originalIcon]) as keyof typeof MDX_ICONS | undefined;

  // prepare the React node
  let icon: ReactNode = null;
  if (typeof originalIcon === "string") {
    if (originalIcon in MDX_ICONS) icon = createElement(MDX_ICONS[originalIcon as keyof typeof MDX_ICONS]);
    else if (possibleKey && possibleKey in MDX_ICONS) icon = createElement(MDX_ICONS[possibleKey]);
  }

  const [isOpen, setOpen] = useState(false);

  return (
    <details
      className="mb-6 rounded-md bg-theme-light-collapsible dark:bg-theme-dark-collapsible"
      onToggle={() => setOpen((open) => !open)}
    >
      <summary
        className="group flex w-full cursor-pointer items-center justify-between border-text-light border-opacity-10 px-6 py-5 text-left dark:border-opacity-100"
        style={{
          borderBottomWidth: isOpen ? "1px" : "0",
        }}
      >
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-1.5 text-xl text-text-light dark:text-text-dark">
            {icon && <div className="collapsible-icon">{icon}</div>}
            {title}
          </h3>
          <p className="text-base leading-6 text-text-light dark:text-text-dark">{description}</p>
        </div>
        <Chevron
          className="mr-2 size-5 opacity-70 transition-transform duration-200 *:text-text-light group-hover:opacity-100 dark:*:text-text-dark"
          style={{
            transform: isOpen ? "rotate(-180deg)" : "none",
          }}
        />
      </summary>
      <div className="px-6 py-2">{children}</div>
    </details>
  );
}
