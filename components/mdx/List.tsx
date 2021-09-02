import classNames from "classnames";

export function ListItem(props: JSX.IntrinsicElements["li"]) {
  return <li className="mb-4 ml-4 mt-2" {...props} />;
}

interface ListProps {
  className: string;
  as: "ul" | "ol";
}

function List({ className, as: As, ...props }: ListProps) {
  const classes = classNames(
    "text-text-light dark:text-text-dark mb-4 list-inside",
    className
  );

  return <As className={classes} {...props} />;
}

export function UnorderedList(props: JSX.IntrinsicElements["ul"]) {
  return <List as="ul" className="list-disc" {...props} />;
}

export function OrderedList(props: JSX.IntrinsicElements["ol"]) {
  return <List as="ol" className="list-decimal" {...props} />;
}
