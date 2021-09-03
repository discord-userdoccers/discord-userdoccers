import Link from "next/link";

export interface BadgeProps {
  href: string;
  tooltip: string;
  name: string;
}

export default function Badge(props: BadgeProps) {
  return (
    <Link href={props.href}>
      <a className="inline-flex items-center px-2.5 py-0.5 dark:text-text-dark text-text-light font-mono text-xs font-medium dark:bg-theme-dark-sidebar bg-theme-light-sidebar rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blurple focus-visible:ring-opacity-75">
        <abbr title={props.tooltip} className="no-underline">
          {props.name}
        </abbr>
      </a>
    </Link>
  );
}
