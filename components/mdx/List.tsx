import classNames from "classnames";

export function ListItem(props) {
  return <li className="mb-4 ml-4 mt-2" {...props} />;
}

function List({ className, as: As, ...props }) {
  const classes = classNames(
    "text-text-light dark:text-text-dark mb-4 list-inside",
    className
  );

  return <As className={classes} {...props} />;
}

export function UnorderedList(props) {
  return <List as="ul" className="list-disc" {...props} />;
}

export function OrderedList(props) {
  return <List as="ol" className="list-decimal" {...props} />;
}
