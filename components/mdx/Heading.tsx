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
  children: React.ReactNode;
}

function Heading({ as: As, className, children }: HeadingProps) {
  const anchor = getText(children);
  const classes = classNames(
    "flex items-center text-black dark:text-white",
    className
  );

  return (
    <a href={`#${anchor}`}>
      <As id={anchor} className={classes}>
        {children}
        <HyperlinkIcon className="ml-2 w-4 h-4" />
      </As>
    </a>
  );
}

export function H1(props) {
  return (
    <Heading
      as="h1"
      className="mb-10 mt-12 text-4xl font-bold leading-loose"
      {...props}
    />
  );
}

export function H2(props) {
  return (
    <Heading
      as="h2"
      className="mb-8 mt-10 text-2xl font-semibold leading-relaxed"
      {...props}
    />
  );
}

export function H3(props) {
  return (
    <Heading
      as="h3"
      className="mb-6 mt-8 text-xl font-medium leading-normal"
      {...props}
    />
  );
}

export function H4(props) {
  return (
    <Heading
      as="h4"
      className="mb-4 mt-6 text-lg font-medium leading-normal"
      {...props}
    />
  );
}

export function H5(props) {
  return (
    <Heading
      as="h5"
      className="mb-4 mt-6 text-base font-medium leading-normal"
      {...props}
    />
  );
}

export function H6(props) {
  return (
    <Heading
      as="h6"
      className="mb-4 mt-6 text-base font-medium leading-normal"
      {...props}
    />
  );
}
