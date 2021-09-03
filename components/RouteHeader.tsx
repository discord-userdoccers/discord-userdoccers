import { Fragment } from "react";
import classNames from "classnames";
import { H3 } from "./mdx/Heading";
import Badge from "./Badge";

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

interface RouteHeaderProps {
  method: RESTMethod;
  url: string;
  children: React.ReactNode;
  supportsXAuditLogHeader?: boolean;
  requestDoesNotRequireAuthorizationHeader?: boolean;
}

export default function RouteHeader({
  method,
  url,
  children,
  supportsXAuditLogHeader,
  requestDoesNotRequireAuthorizationHeader,
}: RouteHeaderProps) {
  return (
    <Fragment>
      <H3 className="mb-0">{children}</H3>
      <div className="flex items-center mt-1">
        <MethodBadge method={method} />
        <code className="p-2 dark:text-text-dark text-text-light break-words">
          {url}
        </code>
      </div>
      <div className="flex gap-2 items-center mt-2">
        {requestDoesNotRequireAuthorizationHeader ? (
          <Badge
            href="/reference#unauthenticated-request"
            name="Unauthenticated Request"
            tooltip="Request does not require the Authorization header"
          />
        ) : null}
        {supportsXAuditLogHeader ? (
          <Badge
            href="/resources/audit-log#x-audit-log-reason"
            tooltip="Supports X-Audit-Log-Reason Header"
            name="X-Audit-Log-Reason"
          />
        ) : null}
      </div>
    </Fragment>
  );
}
