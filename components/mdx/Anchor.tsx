import classNames from "classnames";
import Link from "next/link";

function DocLink({ href, ...props }) {
  return (
    <Link href={href}>
      <a {...props} />
    </Link>
  );
}

export default function Anchor({ href, className, ...props }) {
  const classes = classNames("text-brand-link underline", className);

  if (href.startsWith("/")) {
    return <DocLink href={href} className={classes} {...props} />;
  }

  return <a className={classes} href={href} {...props} />;
}
