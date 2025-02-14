import { PropsWithChildren, useState } from "react";
import Paragraph from "./Paragraph";

interface CollapsibleProps {
  // TODO: use icon
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export default function Collapsible({
  children: originalChildren,
  title,
  description,
}: PropsWithChildren<CollapsibleProps>) {
  const [isOpen, setIsOpen] = useState(false);

  // for some reason the first element in children is a string but the rest are <p> elements, this is just a hack
  // FIXME(splatterxl): why is this needed?
  const children = Array.isArray(originalChildren) ? Array.from(originalChildren) : [originalChildren];
  if (typeof children[0] === "string") {
    children[0] = <Paragraph>{children[0]}</Paragraph>;
  }

  return (
    <section className="rounded-md bg-theme-light-collapsible dark:bg-theme-dark-collapsible">
      <button
        className="w-full border-text-light border-opacity-10 px-5 py-4 text-left dark:border-opacity-100"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderBottomWidth: isOpen ? "1px" : "0",
        }}
      >
        <h3>{title}</h3>
        <p className="text-base leading-6 text-text-light dark:text-text-dark">{description}</p>
      </button>

      <div
        className="px-5 pb-2 pt-2"
        style={{
          // hide visually to allow crawlers/algolia to index the entire text without interacting
          display: isOpen ? "block" : "none",
        }}
      >
        {children}
      </div>
    </section>
  );
}
