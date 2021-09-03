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

export default function Anchor({
  href,
  className,
  ...props
}: JSX.IntrinsicElements["a"]) {
  const classes = classNames("text-brand-link hover:underline", className);

  if (href?.startsWith("/")) {
    return <DocLink href={href} className={classes} {...props} />;
  }

  return <a className={classes} href={href} {...props} />;
}
