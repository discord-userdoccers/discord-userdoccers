import classNames from "classnames";
import React from "react";

export function ListItem(props: React.JSX.IntrinsicElements["li"]) {
  return <li className="mb-4 ml-4 mt-2" {...props} />;
}

interface ListProps {
  className: string;
  as: "ul" | "ol";
}

function List({ className, as: As, ...props }: ListProps) {
  const classes = classNames("mb-4 dark:text-text-dark text-text-light list-inside", className);

  return <As className={classes} {...props} />;
}

export function UnorderedList(props: React.JSX.IntrinsicElements["ul"]) {
  return <List as="ul" className="list-disc" {...props} />;
}

export function OrderedList(props: React.JSX.IntrinsicElements["ol"]) {
  return <List as="ol" className="list-decimal" {...props} />;
}
