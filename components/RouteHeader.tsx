import CopyIcon from "@components/icons/Copy";
import TickIcon from "@components/icons/Tick";
import classNames from "@lib/classnames";
import { LANGUAGE_CONFIG } from "@lib/type-generator/languageConfig";
import { useCodegenLanguage, useToast } from "@lib/type-generator/store";
import { RefObject, useEffect, useRef, useState } from "react";
import Badge from "./Badge";
import { H3 } from "./mdx/Heading";

function CopyButton(props: { info: RouteHeaderProps; ref: RefObject<HTMLDivElement> }) {
  const { showSuccessToast, showErrorToast } = useToast();
  const { selectedLanguage } = useCodegenLanguage();

  const [showCopyIcon, setShowCopyIcon] = useState(false);

  useEffect(() => {
    if (showCopyIcon) {
      setTimeout(() => {
        setShowCopyIcon(false);
      }, 1000);
    }
  }, [showCopyIcon]);

  const tryCopyCodeToClipboard = async () => {
    const ref = props.ref.current;

    const generator = LANGUAGE_CONFIG[selectedLanguage].endpointGenerator;

    const code = generator(ref, props.info);

    (async () => {
      await navigator.clipboard
        .writeText(code!)
        .catch((err) => {
          console.error(err);
          showErrorToast("Failed to copy code to clipboard. Check console for details.");
        })
        .then(() => {
          showSuccessToast("Copied code to clipboard.");
          setShowCopyIcon(true);
        });
    })();
  };

  return (
    <div>
      {showCopyIcon && (
        <TickIcon className="my-auto h-5 w-5 cursor-pointer select-none" onClick={() => tryCopyCodeToClipboard()} />
      )}
      {!showCopyIcon && (
        <CopyIcon className="my-auto h-5 w-5 cursor-pointer select-none" onClick={() => tryCopyCodeToClipboard()} />
      )}
    </div>
  );
}

export type RESTMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

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

export interface RouteHeaderProps {
  method: RESTMethod;
  url: string;
  children: React.ReactNode;
  supportsAuditReason?: boolean;
  unauthenticated?: boolean;
  mfa?: boolean;
  supportsOAuth2?: string | boolean;
  deprecated?: boolean;
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
}: RouteHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  return (
    <div>
      <div ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <H3 className="mb-0">{children}</H3>
        <div className="flex">
          <div className="mt-1 flex items-center">
            <MethodBadge method={method} />
            <code className="break-all p-2 text-text-light dark:text-text-dark">{url}</code>
          </div>
          {hover ? (
            <div className="mt-1 flex items-center">
              <CopyButton
                info={
                  {
                    method,
                    url,
                    children,
                    supportsAuditReason,
                    unauthenticated,
                    mfa,
                    supportsOAuth2,
                    deprecated,
                  } as RouteHeaderProps
                }
                ref={ref as React.RefObject<HTMLDivElement>}
              />
            </div>
          ) : null}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {mfa ? (
            <Badge
              href="/resources/user#user-object"
              name="MFA Required"
              tooltip="Requires a user with MFA enabled to provide a valid MFA code in the body for certain operations"
            />
          ) : null}
          {supportsAuditReason ? (
            <Badge
              href="/resources/audit-log#x-audit-log-reason"
              name="Audit Log Reason"
              tooltip="Supports the X-Audit-Log-Reason header"
            />
          ) : null}
          {unauthenticated ? (
            <Badge
              href="/reference#unauthenticated-request"
              name="Unauthenticated"
              tooltip="Does not require authentication"
            />
          ) : null}
          {supportsOAuth2 ? (
            <Badge
              href="/topics/oauth2"
              name="OAuth2"
              tooltip={`Supports OAuth2 for authentication${
                supportsOAuth2 !== true ? ` with the "${supportsOAuth2}" scope` : ""
              }`}
            />
          ) : null}
          {deprecated ? (
            <Badge
              href="/reference#deprecated-endpoint"
              name="Deprecated"
              tooltip="This endpoint is still active but should be avoided as it is considered deprecated"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
