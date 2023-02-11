import classNames from "classnames";
import { Fragment } from "react";
import Badge from "./Badge";
import { H3 } from "./mdx/Heading";

type RESTMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface MethodBadgeProps {
  method: RESTMethod;
}

function MethodBadge({ method }: MethodBadgeProps) {
  const name = method.toUpperCase();

  const classes = classNames("px-2 py-1 text-sm dark:bg-opacity-50 border-2 dark:border-opacity-50 rounded uppercase", {
    "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white border-blue-500": name === "GET",
    "bg-green-100 text-green-700 dark:bg-green-600 dark:text-white border-green-500": name === "POST",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white border-yellow-500":
      name === "PATCH" || name === "PUT",
    "bg-red-100 text-red-500 dark:bg-red-700 dark:text-white border-red-500": name === "DELETE",
  });

  return <code className={classes}>{method}</code>;
}

interface RouteHeaderProps {
  method: RESTMethod;
  url: string;
  children: React.ReactNode;
  supportsAuditReason?: boolean;
  unauthenticated?: boolean;
  supportsOAuth2?: string | null;
}

export default function RouteHeader({
  method,
  url,
  children,
  supportsAuditReason,
  unauthenticated,
  supportsOAuth2,
}: RouteHeaderProps) {
  return (
    <Fragment>
      <H3 className="mb-0">{children}</H3>
      <div className="flex items-center mt-1">
        <MethodBadge method={method} />
        <code className="p-2 dark:text-text-dark text-text-light break-all">{url}</code>
      </div>
      <div className="flex gap-2 items-center mt-2">
        {unauthenticated ? (
          <Badge
            href="/reference#unauthenticated-request"
            name="Unauthenticated"
            tooltip="Does not require authentication"
          />
        ) : null}
        {supportsAuditReason ? (
          <Badge
            href="/resources/audit-log#x-audit-log-reason"
            name="Audit Log Reason"
            tooltip="Supports the X-Audit-Log-Reason Header"
          />
        ) : null}
        {supportsOAuth2 !== undefined ? (
          <Badge
            href="/topics/oauth2"
            name="OAuth2"
            tooltip={`Supports OAuth2 for authentication${supportsOAuth2 ? ` with the "${supportsOAuth2}" scope` : ""}`}
          />
        ) : null}
      </div>
    </Fragment>
  );
}
