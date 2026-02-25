import Link from "next/link";

interface BadgeProps {
  href: string;
  tooltip: string;
  name: string;
}

export default function Badge({ href, name, tooltip }: BadgeProps) {
  return (
    <Link
      href={href}
      className="bg-theme-light-sidebar text-text-light focus-visible:ring-brand-blurple/75 dark:bg-sidebar-secondary-dark dark:text-text-dark inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-medium focus:outline-hidden focus-visible:ring-2"
    >
      <abbr title={tooltip} className="no-underline">
        {name}
      </abbr>
    </Link>
  );
}
