import Link from "next/link";
import type { FC } from "react";

interface IconBadgeProps {
  href: string;
  tooltip: string;
  icon: FC<React.JSX.IntrinsicElements["svg"]>;
}

export default function IconBadge(props: IconBadgeProps) {
  const { href, tooltip } = props;

  return (
    <Link href={href}>
      <abbr title={tooltip} className="no-underline">
        <props.icon className="h-5 min-h-4 w-5 min-w-4" />
      </abbr>
    </Link>
  );
}
