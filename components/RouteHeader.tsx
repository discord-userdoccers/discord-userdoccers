import { Fragment } from "react";
import classNames from "classnames";
import { H3 } from "./mdx/Heading";
import InlineCode from "./mdx/InlineCode";

type RESTMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface MethodBadgeProps {
  method: RESTMethod;
}
function MethodBadge({ method }: MethodBadgeProps) {
  const name = method.toUpperCase();

  const classes = classNames("px-2 py-1 text-sm rounded uppercase border-2", {
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
  return <a href="/docs/resources/audit-log#x-audit-log-reason" className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white border-2 border-blue-500">
    Supports <span className="ml-1"><InlineCode>X-Audit-Log-Reason</InlineCode></span>
  </a>;
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
      <div className="justify-between md:items-end gap-2 grid auto-cols-auto lg:flex">
        <H3 className="mb-0">{children}</H3>
        {supportsXAuditLogHeader && <AuditLogHeaderBadge />}
      </div>
      <div className="flex items-center mt-1">
        <MethodBadge method={method} />
        <code className="text-text-light dark:text-text-dark p-2 break-all">
          {url}
        </code>
      </div>
    </Fragment>
  );
}
