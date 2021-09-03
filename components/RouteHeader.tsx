import { Fragment } from "react";
import classNames from "classnames";
import Link from "next/link";
import { H3 } from "./mdx/Heading";

type RESTMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface MethodBadgeProps {
  method: RESTMethod;
}
function MethodBadge({ method }: MethodBadgeProps) {
  const name = method.toUpperCase();

  const classes = classNames("px-2 py-1 text-sm border-2 rounded uppercase", {
    "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white border-blue-500":
      name === "GET",
    "bg-green-100 text-green-700 dark:bg-green-600 dark:text-white border-green-500":
      name === "POST",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white border-yellow-500":
      name === "PATCH" || name === "PUT",
    "bg-red-100 text-red-500 dark:bg-red-700 dark:text-white border-red-500":
      name === "DELETE",
  });

  return <code className={classes}>{method}</code>;
}

function AuditLogHeaderBadge() {
  return (
    <Link href="/resources/audit-log#x-audit-log-reason">
      <a className="inline-flex items-center px-2.5 py-0.5 dark:text-text-dark text-text-light font-mono text-xs font-medium dark:bg-theme-dark-sidebar bg-theme-light-sidebar rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blurple focus-visible:ring-opacity-75">
        <abbr
          title="Supports X-Audit-Log-Reason Header"
          className="no-underline"
        >
          X-Audit-Log-Reason
        </abbr>
      </a>
    </Link>
  );
}

interface RouteHeaderProps {
  method: RESTMethod;
  url: string;
  children: React.ReactNode;
  supportsXAuditLogHeader?: boolean;
}

export default function RouteHeader({
  method,
  url,
  children,
  supportsXAuditLogHeader,
}: RouteHeaderProps) {
  return (
    <Fragment>
      <H3 className="mb-0">{children}</H3>
      <div className="flex items-center mt-1">
        <MethodBadge method={method} />
        <code className="p-2 dark:text-text-dark text-text-light break-all">
          {url}
        </code>
      </div>
      <div className="flex gap-2 items-center mt-2">
        {supportsXAuditLogHeader ? <AuditLogHeaderBadge /> : null}
      </div>
    </Fragment>
  );
}
