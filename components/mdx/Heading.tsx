import classNames from "classnames";
import React, { isValidElement } from "react";
import HyperlinkIcon from "../icons/Hyperlink";

function getText(node: React.ReactNode): string {
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

export interface HeadingProps {
  as: any;
  className: string;
  children?: React.ReactNode;
}

function Heading({ as: As, className, children }: HeadingProps) {
  const anchor = getText(children);
  const classes = classNames(
    "flex items-center text-black dark:text-white",
    className
  );

  return (
    <a className="group" href={`#${anchor}`}>
      <As id={anchor} className={classes}>
        {children}
        <HyperlinkIcon className="min-w-4 min-h-4 motion-safe:animate-fade-in-out md:group-hover:inline-flex ml-2 w-4 h-4 md:hidden" />
      </As>
    </a>
  );
}

export function H1({ className, ...props }: JSX.IntrinsicElements["h1"]) {
  const classes = classNames(
    "not:first-of-type:mt-10 mb-8 text-4xl font-bold leading-tight sm:leading-loose",
    className
  );
  return <Heading as="h1" className={classes} {...props} />;
}

export function H2({ className, ...props }: JSX.IntrinsicElements["h2"]) {
  const classes = classNames(
    "mb-6 mt-8 text-2xl font-semibold leading-relaxed",
    className
  );
  return <Heading as="h2" className={classes} {...props} />;
}

export function H3({ className, ...props }: JSX.IntrinsicElements["h3"]) {
  const classes = classNames(
    "mb-4 mt-6 text-xl font-medium leading-normal",
    className
  );
  return <Heading as="h3" className={classes} {...props} />;
}

export function H4({ className, ...props }: JSX.IntrinsicElements["h4"]) {
  const classes = classNames(
    "mb-4 mt-6 text-lg font-medium leading-normal",
    className
  );
  return <Heading as="h4" className={classes} {...props} />;
}

export function H5({ className, ...props }: JSX.IntrinsicElements["h5"]) {
  const classes = classNames(
    "mb-4 mt-6 text-base font-medium leading-normal",
    className
  );
  return <Heading as="h5" className={classes} {...props} />;
}

export function H6({ className, ...props }: JSX.IntrinsicElements["h6"]) {
  const classes = classNames(
    "mb-4 mt-6 text-base font-medium leading-normal",
    className
  );
  return <Heading as="h6" className={classes} {...props} />;
}
