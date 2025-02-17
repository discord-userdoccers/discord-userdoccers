import { PropsWithChildren, useState } from "react";
import Paragraph from "./Paragraph";
import Chevron from "../icons/Chevron";

interface CollapsibleProps {
  // TODO: use icon
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export default function Collapsible({
  children: originalChildren,
  icon,
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
        className="group flex w-full items-center justify-between border-text-light border-opacity-10 px-6 py-5 text-left dark:border-opacity-100"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderBottomWidth: isOpen ? "1px" : "0",
        }}
      >
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center justify-start gap-1.5 text-xl">
            <div className="collapsible-icon">{icon}</div>
            {title}
          </h3>
          <p className="text-base leading-6 text-text-light dark:text-text-dark">{description}</p>
        </div>
        <Chevron
          className="mr-2 size-4 opacity-50 transition-all group-hover:opacity-100"
          style={{
            // rotate 180 deg if open
            transform: isOpen ? "rotate(-180deg)" : "none",
          }}
        />
      </button>

      <div
        className="px-6 py-2"
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
