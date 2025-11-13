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
      className="inline-flex items-center rounded-full bg-theme-light-sidebar px-2.5 py-0.5 font-mono text-xs font-medium text-text-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blurple focus-visible:ring-opacity-75 dark:bg-sidebar-secondary-dark dark:text-text-dark"
    >
      <abbr title={tooltip} className="no-underline">
        {name}
      </abbr>
    </Link>
  );
}
