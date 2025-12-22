import classNames from "@lib/classnames";
import { useRef, useState } from "react";
import IconBadge from "./IconBadge";
import { getNormalisedText, H3 } from "./mdx/Heading";
import { WarningIcon } from "./mdx/icons/WarningIcon";
import { RobotIcon } from "./mdx/icons/RobotIcon";
import { WrenchIcon } from "./mdx/icons/WrenchIcon";
import { LockUnlockedIcon } from "./mdx/icons/LockUnlockedIcon";
import { TopicsIcon } from "./mdx/icons/TopicsIcon";
import { KeyIcon } from "./mdx/icons/KeyIcon";
import RouteTestDialog from "./RouteTestDialog";

export type RESTMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface MethodBadgeProps {
  method: RESTMethod;
}

export function MethodBadge({ method }: MethodBadgeProps) {
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
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="group">
      <H3 className="mb-0" useAnchor={false} useCopy={false}>
        {/* NOTE: this margin is a hack cause the font sucks */}
        <a className="mb-[1px]" href={`#${anchor}`}>
          {children}
        </a>
        <span className="ml-2 flex items-center gap-2">
          {supportsBot ? (
            <IconBadge href="/resources/application" tooltip="Supports bot users" icon={RobotIcon} />
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
            <IconBadge href="/reference#authentication" tooltip="Unauthenticated" icon={LockUnlockedIcon} />
          ) : null}
          {mfa ? (
            <IconBadge href="/authentication#mfa-verification" tooltip="MFA may be required" icon={KeyIcon} />
          ) : null}
          {supportsAuditReason ? (
            <IconBadge
              href="/resources/audit-log#x-audit-log-reason"
              tooltip="Supports audit log reason"
              icon={TopicsIcon}
            />
          ) : null}
          {deprecated ? (
            <IconBadge
              href="/reference#deprecated-endpoint"
              tooltip="Endpoint is still active but should be avoided"
              icon={WarningIcon}
            />
          ) : null}
        </span>
      </H3>
      <div ref={containerRef} className="mt-1 flex items-center">
        <MethodBadge method={method} />
        <code className="break-all p-2 text-base text-text-light dark:text-text-dark">{url}</code>
        <button
          onClick={() => setIsTestDialogOpen(true)}
          className="ml-auto rounded bg-brand-blurple px-3 py-1 text-xs text-white opacity-0 transition-opacity hover:bg-brand-blurple/80 focus:opacity-100 group-hover:opacity-100"
        >
          Test
        </button>
      </div>
      <RouteTestDialog
        isOpen={isTestDialogOpen}
        onClose={() => setIsTestDialogOpen(false)}
        method={method}
        url={url}
        triggerRef={containerRef}
        supportsAuditReason={supportsAuditReason}
      />
    </div>
  );
}
