import classNames from "classnames";
import Link from "next/link";

type DocLinkProps = JSX.IntrinsicElements["a"] & {
  href: string;
};

function DocLink({ href, ...props }: DocLinkProps) {
  return (
    <Link href={href}>
      <a {...props} />
    </Link>
  );
}

type AnchorProps = JSX.IntrinsicElements["a"] & {
  href: string;
  className: string;
};

export default function Anchor({ href, className, ...props }: AnchorProps) {
  const classes = classNames("text-brand-link underline", className);

  if (href.startsWith("/")) {
    return <DocLink href={href} className={classes} {...props} />;
  }

  return <a className={classes} href={href} {...props} />;
}
