import React, { isValidElement } from "react";

function getText(node: React.ReactNode): string{
  if (typeof node === "string") {
    return node.toLowerCase().replaceAll(" ", "-");
  }

  if (typeof node === "number") {
    return node.toLocaleString();
  }

  if (isValidElement(node)) {
    return getText(node.props.children);
  }

  if (Array.isArray(node)) {
    return node.map((element) => getText(element)).join("");
  }
  return "";
}

interface HeadingProps {
  // TODO: Can a string be rendered as a react component?? That'\s news to me lol. Can someone figure out the proper typing for this?
  as: any
  children: React.ReactNode
};

export default function Heading ({ as: As, children }: HeadingProps) {
  const anchor = getText(children);

  return (
    <a href={`#${anchor}`}>
      <As id={anchor} className="flex items-center">
        {children}
        <HyperlinkIcon />
      </As>
    </a>
  );
}

// TODO: Use Discord version
function HyperlinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
    </svg>
  );
}
