import classNames from "@lib/classnames";
import React, { isValidElement, ReactNode } from "react";
import HyperlinkIcon from "../icons/Hyperlink";
import TickIcon from "../icons/Tick";

export function getNormalisedText(node: ReactNode): string {
  if (typeof node === "string") {
    return node.toLowerCase().replaceAll(" ", "-");
  }

  if (typeof node === "number") {
    return node.toLocaleString();
  }

  if (isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: ReactNode }>;
    return getNormalisedText(element.props.children ?? "");
  }

  if (Array.isArray(node)) {
    return node.map((element) => getNormalisedText(element)).join("");
  }

  return "";
}

export interface HeadingProps {
  as: keyof React.JSX.IntrinsicElements;
  useAnchor?: boolean;
  useCopy?: boolean;
  className: string;
  children?: React.ReactNode;
}

function Heading({ as: As, className, children, useAnchor = true, useCopy = true }: HeadingProps) {
  const anchor = getNormalisedText(children);
  const classes = classNames("flex items-center text-black dark:text-white", className);
  const [showingCopied, setShowingCopied] = React.useState(false);

  // return to normal icon after 1 second
  React.useEffect(() => {
    if (showingCopied) {
      const timeout = setTimeout(() => {
        setShowingCopied(false);
      }, 1000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [showingCopied]);

  return (
    <As className={`group ${classes}`} id={anchor}>
      {useAnchor ? <a href={`#${anchor}`}>{children}</a> : children}
      {useCopy && (
        <button
          type="button"
          // href={`#${anchor}`}
          onClick={() => {
            navigator.clipboard
              .writeText(`${window.location.href.split("#")[0]}#${anchor}`)
              .then(() => {
                setShowingCopied(true);
              })
              .catch(() => {
                // noop to avoid unhandled promise rejection
              });
          }}
        >
          {React.createElement(showingCopied ? TickIcon : HyperlinkIcon, {
            className: `-m-1 ${
              As === "h1" ? "mb-0.25" : "mb-0.5"
            } min-w-4 min-h-4 md:group-hover:inline-flex ml-2 w-5 h-5 motion-safe:animate-fade-in-out md:hidden`,
          })}
        </button>
      )}
    </As>
  );
}

type MDXHeadingProps<Element extends keyof React.JSX.IntrinsicElements> = React.JSX.IntrinsicElements[Element] &
  Partial<Omit<HeadingProps, "as">>;

export function H1({ className, ...props }: MDXHeadingProps<"h1">) {
  const classes = classNames(
    "not:first-of-type:mt-2 mb-2 mt-3 text-4xl font-bold leading-tight sm:leading-loose",
    className,
  );
  return <Heading as="h1" className={classes} {...props} />;
}

export function H2({ className, ...props }: MDXHeadingProps<"h2">) {
  const classes = classNames("mb-4 mt-6 text-2xl font-semibold leading-relaxed", className);
  return <Heading as="h2" className={classes} {...props} />;
}

export function H3({ className, ...props }: MDXHeadingProps<"h3">) {
  const classes = classNames("mb-2 mt-6 text-xl font-medium leading-normal", className);
  return <Heading as="h3" className={classes} {...props} />;
}

export function H4({ className, ...props }: MDXHeadingProps<"h4">) {
  const classes = classNames("mb-2 mt-4 text-lg font-medium leading-normal", className);
  return <Heading as="h4" className={classes} {...props} />;
}

export function H5({ className, ...props }: MDXHeadingProps<"h5">) {
  const classes = classNames("mb-4 mt-6 text-base font-medium leading-normal", className);
  return <Heading as="h5" className={classes} {...props} />;
}

export function H6({ className, ...props }: MDXHeadingProps<"h6">) {
  const classes = classNames("mb-4 mt-6 text-base font-medium leading-normal", className);
  return <Heading as="h6" className={classes} {...props} />;
}
