import classNames from "@lib/classnames";
import { Link, type LinkProps } from "react-router-dom";
import React from "react";

// hack to make the props like each other
type DocLinkProps = React.ForwardRefExoticComponent<
  React.AnchorHTMLAttributes<HTMLAnchorElement> &
    LinkProps & {
      children?: React.ReactNode | null;
    } & React.RefAttributes<HTMLAnchorElement>
> & { href: string };

function DocLink({ href, ...props }: DocLinkProps) {
  return <Link to={href} {...props} />;
}

export default function Anchor({ href, className, ...props }: React.JSX.IntrinsicElements["a"]) {
  const classes = classNames("text-brand-link-light dark:text-brand-link-dark hover:underline", className);

  if (href?.startsWith("/")) {
    // @ts-expect-error This works but TypeScript hates it. Can't be bothered finding out why it errors
    return <DocLink href={href} className={classes} {...props} />;
  }

  return <a className={classes} href={href} {...props} />;
}
