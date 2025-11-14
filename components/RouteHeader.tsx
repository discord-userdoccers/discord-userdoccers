import classNames from "@lib/classnames";
import { Fragment } from "react";
import IconBadge from "./IconBadge";
import { getNormalisedText, H3 } from "./mdx/Heading";
import { WarningIcon } from "./mdx/icons/WarningIcon";
import { RobotIcon } from "./mdx/icons/RobotIcon";
import { WrenchIcon } from "./mdx/icons/WrenchIcon";
import { LockUnlockedIcon } from "./mdx/icons/LockUnlockedIcon";
import { TopicsIcon } from "./mdx/icons/TopicsIcon";
import { KeyIcon } from "./mdx/icons/KeyIcon";

type RESTMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface MethodBadgeProps {
  method: RESTMethod;
}

function MethodBadge({ method }: MethodBadgeProps) {
  const name = method.toUpperCase();

  const classes = classNames(
    "px-2 py-1 text-sm dark:bg-opacity-50 border-2 dark:border-opacity-50 rounded-xl uppercase",
    {
      "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white border-blue-500": name === "GET",
      "bg-green-100 text-green-700 dark:bg-green-600 dark:text-white border-green-500": name === "POST",
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white border-yellow-500": name === "PATCH",
      "bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-white border-orange-500": name === "PUT",
      "bg-red-100 text-red-500 dark:bg-red-700 dark:text-white border-red-500": name === "DELETE",
    },
  );

  return <code className={classes}>{method}</code>;
}

interface RouteHeaderProps {
  method: RESTMethod;
  url: string;
  children: React.ReactNode;
  supportsAuditReason?: boolean;
  unauthenticated?: boolean;
  mfa?: boolean;
  supportsOAuth2?: string | boolean;
  deprecated?: boolean;
  supportsBot?: boolean;
}

export default function RouteHeader({
  method,
  url,
  children,
  supportsAuditReason,
  unauthenticated,
  mfa,
  supportsOAuth2,
  deprecated,
  supportsBot,
}: RouteHeaderProps) {
  const anchor = getNormalisedText(children);

  return (
    <Fragment>
      <H3 className="mb-0" useAnchor={false} useCopy={false}>
        {/* NOTE: this margin is a hack cause the font sucks */}
        <a className="mb-[1px]" href={`#${anchor}`}>
          {children}
        </a>
        <span className="ml-2 flex items-center gap-2">
          {supportsBot ? (
            <IconBadge href="/resources/application" tooltip="This endpoint can be used by bots" icon={RobotIcon} />
          ) : null}
          {supportsOAuth2 ? (
            <IconBadge
              href="/topics/oauth2"
              tooltip={`Supports OAuth2 for authentication${
                supportsOAuth2 !== true ? ` with the "${supportsOAuth2}" scope` : ""
              }`}
              icon={WrenchIcon}
            />
          ) : null}
          {unauthenticated ? (
            <IconBadge
              href="/reference#unauthenticated-request"
              tooltip="Does not require authentication"
              icon={LockUnlockedIcon}
            />
          ) : null}
          {mfa ? (
            <IconBadge
              href="/resources/user#user-object"
              tooltip="Requires a user with MFA enabled to provide a valid MFA code in the body for certain operations"
              icon={KeyIcon}
            />
          ) : null}
          {supportsAuditReason ? (
            <IconBadge
              href="/resources/audit-log#x-audit-log-reason"
              tooltip="Supports the X-Audit-Log-Reason header"
              icon={TopicsIcon}
            />
          ) : null}
          {deprecated ? (
            <IconBadge
              href="/reference#deprecated-endpoint"
              tooltip="This endpoint is still active but should be avoided as it is considered deprecated"
              icon={WarningIcon}
            />
          ) : null}
        </span>
      </H3>
      <div className="mt-1 flex items-center">
        <MethodBadge method={method} />
        <code className="break-all p-2 text-base text-text-light dark:text-text-dark">{url}</code>
      </div>
    </Fragment>
  );
}
