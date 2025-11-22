import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, RefObject, useEffect, useState } from "react";
import classNames from "../lib/classnames";
import Styles from "../stylesheets/modules/Errors.module.css";
import { H2 } from "./mdx/Heading";
import Code from "./mdx/Code";
import { CircleErrorIcon as SettingsIcon } from "./mdx/icons/SettingsIcon";
import { Tokenizer } from "../lib/type-generator/tokenizer";
import { MethodBadge, type RESTMethod } from "./RouteHeader";
import { toast } from "react-toastify";
import platform from "platform";

const USER_TOKEN_REGEX: RegExp = /[\w]{24}\.[\w]{6}\.[\w-_]{27}/;
const BOT_TOKEN_REGEX: RegExp = /^Bot\s+([\w]{24}\.[\w]{6}\.[\w-_]{27})/;
const BEARER_TOKEN_REGEX: RegExp = /^(?:Bearer\s+)?([\w]{24}\.[\w-_]{30})$/;

let cachedSuperProperties: string | undefined;

async function getSuperProperties(): Promise<string> {
  if (cachedSuperProperties) return cachedSuperProperties;

  const result = await fetch("https://cordapi.dolfi.es/api/v2/properties/web", {
    method: "POST",
  });

  const { properties } = await result.json();
  if (!result.ok || !properties) {
    throw new Error(`Failed to fetch super properties: ${result.status} ${result.statusText} (${await result.text()})`);
  }

  const superProperties = {
    ...properties,
    os: getOS(),
    os_version: platform?.os?.version ?? "",
    browser: getBrowser(),
    browser_user_agent: navigator.userAgent || "",
    browser_version: platform.version || "",
    device: getDevice(),
    // @ts-expect-error legacy fields
    system_locale: navigator.language ?? navigator.browserLanguage ?? navigator.userLanguage ?? "",
  };

  cachedSuperProperties = btoa(JSON.stringify(superProperties));
  return cachedSuperProperties;
}

export function getOS(): string {
  const { userAgent } = window.navigator;
  if (/Windows/i.test(userAgent)) {
    return /Phone/.test(userAgent) ? "Windows Mobile" : "Windows";
  } else if (/(iPhone|iPad|iPod)/.test(userAgent)) {
    return "iOS";
  } else if (/Android/.test(userAgent)) {
    return "Android";
  } else if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
    return "BlackBerry";
  } else if (/Mac/i.test(userAgent)) {
    return window.navigator.maxTouchPoints > 2 ? "iOS" : "Mac OS X";
  } else if (/Linux/i.test(userAgent)) {
    return "Linux";
  } else {
    return "";
  }
}

function getBrowser(): string {
  const { userAgent, vendor = "" } = window.navigator;

  // @ts-expect-error opera may exist
  if (window.opera) {
    return /Mini/.test(userAgent) ? "Opera Mini" : "Opera";
  } else if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
    return "BlackBerry";
  } else if (/FBIOS/.test(userAgent)) {
    return "Facebook Mobile";
  } else if (/CriOS/.test(userAgent)) {
    return "Chrome iOS";
  } else if (/Apple/.test(vendor)) {
    return /Mobile/.test(userAgent) || window.navigator.maxTouchPoints > 2 ? "Mobile Safari" : "Safari";
  } else if (/Android/.test(userAgent)) {
    return /Chrome/.test(userAgent) ? "Android Chrome" : "Android Mobile";
  } else if (/Edge/.test(userAgent)) {
    return "Edge";
  } else if (/Chrome/.test(userAgent)) {
    return "Chrome";
  } else if (/Konqueror/.test(userAgent)) {
    return "Konqueror";
  } else if (/Firefox/.test(userAgent)) {
    return "Firefox";
  } else if (/MSIE|Trident\//.test(userAgent)) {
    return "Internet Explorer";
  } else if (/Gecko/.test(userAgent)) {
    return "Mozilla";
  } else {
    return "";
  }
}

export function getDevice(): string {
  const { userAgent } = window.navigator;
  if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
    return "BlackBerry";
  } else if (/Windows Phone/i.test(userAgent)) {
    return "Windows Phone";
  } else if (/Android/.test(userAgent)) {
    return "Android";
  } else if (/iPhone/.test(userAgent)) {
    return "iPhone";
  } else if (/iPad/.test(userAgent)) {
    return "iPad";
  } else {
    return "";
  }
}

async function sendApiRequest(options: {
  url: string;
  method: string;
  pathParams: Record<string, string>;
  queryParams: { key: string; value: string }[];
  body: string;
  token: string;
  apiVersion: string;
  useCanary: boolean;
  locale: string;
  customHeaders: { key: string; value: string }[];
}) {
  const { url, method, pathParams, queryParams, body, token, apiVersion, useCanary, locale, customHeaders } = options;

  let finalUrl = `https://discord.com/api/v${apiVersion}${url}`;

  // Replace path params
  Object.entries(pathParams).forEach(([key, value]) => {
    finalUrl = finalUrl.replace(`{${key}}`, value);
  });

  // Add query params
  const searchParams = new URLSearchParams();
  queryParams.forEach(({ key, value }) => {
    if (key) searchParams.append(key, value);
  });
  const queryString = searchParams.toString();
  if (queryString) {
    finalUrl += "?" + queryString;
  }

  // Headers
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", token);
  }
  if (body) {
    headers.set("Content-Type", "application/json");
  }

  const debugOptions = ["bugReporterEnabled"];
  if (useCanary) debugOptions.push("canary");

  headers.set("X-Debug-Options", debugOptions.join(",")); // TODO: Do we expose trace through here?
  headers.set("X-Discord-Locale", locale);
  headers.set("X-Discord-TimeZone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  // TODO: Maybe handle fingerprint? Auth endpoints don't work cross-origin anyway...

  try {
    headers.set("X-Super-Properties", await getSuperProperties());
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch super properties!");
  }

  customHeaders.forEach(({ key, value }) => {
    if (key) headers.set(key, value);
  });

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (method !== "GET" && method !== "HEAD" && body) {
    fetchOptions.body = body;
  }

  try {
    const res = await fetch(finalUrl, fetchOptions);

    const resBody = await res.text();
    let parsedBody = resBody;
    try {
      parsedBody = JSON.parse(resBody);
    } catch {}

    return {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      body: parsedBody,
    };
  } catch (error: unknown) {
    return {
      status: 0,
      statusText: "Error",
      headers: {},
      body: (error as Error).message,
    };
  }
}

function prettifyHeader(header: string): string {
  const replacements: Record<string, string> = {
    ratelimit: "RateLimit",
    rpc: "RPC",
  };
  return header
    .split("-")
    .map((part) => replacements[part] || part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

interface RouteTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  method: RESTMethod;
  url: string;
  triggerRef?: RefObject<HTMLElement | null>;
}

export default function RouteTestDialog({ isOpen, onClose, method, url, triggerRef }: RouteTestDialogProps) {
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [optionalQueryParams, setOptionalQueryParams] = useState<string[]>([]);
  const [token, setToken] = useState("");
  const [tokenType, setTokenType] = useState<"user" | "bot" | "bearer" | null>(null);
  const [body, setBody] = useState(method === "GET" ? "" : "{}");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiVersion, setApiVersion] = useState("9");
  const [useCanary, setUseCanary] = useState(false);
  const [locale, setLocale] = useState("en-US");
  const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [activeTab, setActiveTab] = useState<"body" | "headers">("body"); // Could be expanded to parse rate limits et al

  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: unknown;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const matches = url.match(/\{([^}]+)\}/g);
    if (matches) {
      const params: Record<string, string> = {};
      matches.forEach((match) => {
        const key = match.slice(1, -1);
        params[key] = "";
      });
      setPathParams(params);
    } else {
      setPathParams({});
    }
    setQueryParams([{ key: "", value: "" }]);
    setOptionalQueryParams([]);
    setResponse(null);
    setBody(method === "GET" ? "" : "{}");
    setActiveTab("body");

    if (isOpen) {
      const storedToken = localStorage.getItem("discord_api_token");
      if (storedToken) {
        setToken(storedToken);
        if (BOT_TOKEN_REGEX.test(storedToken)) setTokenType("bot");
        else if (USER_TOKEN_REGEX.test(storedToken)) setTokenType("user");
        else if (BEARER_TOKEN_REGEX.test(storedToken)) setTokenType("bearer");
        else setTokenType(null);
      }

      const storedVersion = localStorage.getItem("discord_api_version");
      if (storedVersion) {
        setApiVersion(storedVersion);
      }

      const storedCanary = localStorage.getItem("discord_api_use_canary");
      if (storedCanary) {
        setUseCanary(storedCanary === "true");
      }

      const storedLocale = localStorage.getItem("discord_api_locale");
      if (storedLocale) {
        setLocale(storedLocale);
      }

      const storedHeaders = localStorage.getItem("discord_api_custom_headers");
      if (storedHeaders) {
        try {
          const parsed = JSON.parse(storedHeaders);
          if (Array.isArray(parsed)) {
            const last = parsed[parsed.length - 1];
            if (!last || last.key || last.value) {
              parsed.push({ key: "", value: "" });
            }
            setCustomHeaders(parsed);
          }
        } catch {}
      }

      // Parse query params from DOM
      if (triggerRef?.current) {
        let node = triggerRef.current.nextElementSibling;
        let foundTable = false;
        let attempts = 0;
        while (node && !foundTable && attempts < 50) {
          if (node.tagName === "H2" || node.tagName === "H3") {
            break;
          }

          const table = node.tagName === "TABLE" ? (node as HTMLTableElement) : node.querySelector("table");
          if (table) {
            try {
              const tokenizer = new Tokenizer(table);
              const layout = tokenizer.getLayout();

              if (
                layout &&
                (layout.title.type === "QueryStringParams" || layout.title.type?.includes("QueryStringParams"))
              ) {
                console.debug("RouteTestDialog: Found QueryStringParams", layout);
                const required: { key: string; value: string }[] = [];
                const optional: string[] = [];

                layout.contents.forEach((item) => {
                  const name = item.field.type;
                  if (!name) return;
                  if (item.field.undefinable || item.type?.optional) {
                    optional.push(name);
                  } else {
                    required.push({ key: name, value: "" });
                  }
                });

                if (required.length > 0) {
                  setQueryParams((prev) => {
                    if (prev.length === 1 && prev[0].key === "" && prev[0].value === "") {
                      return [...required, { key: "", value: "" }];
                    }
                    return prev;
                  });
                }
                setOptionalQueryParams(optional);
                foundTable = true;
              }
            } catch (e) {
              console.error("Failed to parse table", e);
              toast.error("Failed to parse documentation.");
            }
          }
          node = node.nextElementSibling;
          attempts++;
        }
      }
    }
  }, [url, method, isOpen, triggerRef]);

  const handleSend = async () => {
    if (Object.values(pathParams).some((val) => !val)) return;

    setLoading(true);
    setResponse(null);

    let finalToken = token;
    if (tokenType === "bearer" && !token.startsWith("Bearer ")) {
      finalToken = `Bearer ${token}`;
    }

    const result = await sendApiRequest({
      url,
      method,
      pathParams,
      queryParams,
      body,
      token: finalToken,
      apiVersion,
      useCanary,
      locale,
      customHeaders,
    });

    setResponse(result);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className={classNames(Styles.dialogPanel, "flex h-[72vh] !max-w-4xl flex-col !p-0")}>
                <div className="flex items-center justify-between p-6 pb-2">
                  <DialogTitle
                    as={H2}
                    useAnchor={false}
                    useCopy={false}
                    className="!mb-0 text-text-light dark:text-text-dark"
                  >
                    {isSettingsOpen ? "Settings" : "Test Endpoint"}
                  </DialogTitle>
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <SettingsIcon className="h-6 w-6 fill-current dark:fill-white" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-2">
                  {isSettingsOpen ? (
                    <div className="flex flex-col gap-4 pb-4">
                      <div>
                        <label className={Styles.dialogLabel}>API Version</label>
                        <select
                          className={Styles.dialogInput}
                          value={apiVersion}
                          onChange={(e) => {
                            setApiVersion(e.target.value);
                            localStorage.setItem("discord_api_version", e.target.value);
                          }}
                        >
                          {["6", "7", "8", "9", "10"].map((v) => (
                            <option key={v} value={v}>
                              v{v}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="useCanary"
                          checked={useCanary}
                          onChange={(e) => {
                            setUseCanary(e.target.checked);
                            localStorage.setItem("discord_api_use_canary", String(e.target.checked));
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-brand-blurple focus:ring-brand-blurple"
                        />
                        <label htmlFor="useCanary" className={classNames(Styles.dialogLabel, "!mb-0")}>
                          Use Canary
                        </label>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className={Styles.dialogLabel}>Locale</label>
                          <a
                            href="/reference#locales"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-blurple hover:underline"
                          >
                            Documentation
                          </a>
                        </div>
                        <input
                          type="text"
                          className={Styles.dialogInput}
                          value={locale}
                          onChange={(e) => {
                            setLocale(e.target.value);
                            localStorage.setItem("discord_api_locale", e.target.value);
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className={Styles.dialogLabel}>Custom Headers</label>
                        </div>
                        <div className="flex flex-col gap-2">
                          {customHeaders.map((header, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Key"
                                className={classNames(Styles.dialogInput, "flex-1")}
                                value={header.key}
                                onChange={(e) => {
                                  const newHeaders = [...customHeaders];
                                  newHeaders[index].key = e.target.value;
                                  if (index === newHeaders.length - 1 && (e.target.value || newHeaders[index].value)) {
                                    newHeaders.push({ key: "", value: "" });
                                  }
                                  setCustomHeaders(newHeaders);
                                  localStorage.setItem("discord_api_custom_headers", JSON.stringify(newHeaders));
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Value"
                                className={classNames(Styles.dialogInput, "flex-1")}
                                value={header.value}
                                onChange={(e) => {
                                  const newHeaders = [...customHeaders];
                                  newHeaders[index].value = e.target.value;
                                  if (index === newHeaders.length - 1 && (newHeaders[index].key || e.target.value)) {
                                    newHeaders.push({ key: "", value: "" });
                                  }
                                  setCustomHeaders(newHeaders);
                                  localStorage.setItem("discord_api_custom_headers", JSON.stringify(newHeaders));
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newHeaders = customHeaders.filter((_, i) => i !== index);
                                  if (newHeaders.length === 0) {
                                    newHeaders.push({ key: "", value: "" });
                                  }
                                  setCustomHeaders(newHeaders);
                                  localStorage.setItem("discord_api_custom_headers", JSON.stringify(newHeaders));
                                }}
                                className="px-2 text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center gap-2">
                        <MethodBadge method={method} />
                        <code className="break-all text-base text-text-light dark:text-text-dark">{url}</code>
                      </div>
                      <div className="flex flex-col gap-4 pb-4">
                        <div>
                          <label className={Styles.dialogLabel}>
                            Authorization Token
                            {tokenType === "user" && (
                              <>
                                <span className="ml-2 font-normal">—</span>
                                <span className="ml-2 font-normal text-red-500">
                                  Automating user accounts is against platform Terms of Service. Proceed with caution.
                                </span>
                              </>
                            )}
                            {tokenType === "bot" && (
                              <>
                                <span className="ml-2 font-normal">—</span>
                                <span className="ml-2 font-normal text-orange-500">
                                  Bot tokens are blocked in browsers.
                                </span>
                              </>
                            )}
                          </label>
                          <input
                            type="password"
                            className={classNames(Styles.dialogInput, {
                              "!border-red-500 focus:!border-red-500 focus:!ring-red-500":
                                tokenType == null && token.length > 0,
                            })}
                            placeholder="User or bearer token"
                            value={token}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => {
                              const val = e.target.value;
                              setToken(val);
                              localStorage.setItem("discord_api_token", val);

                              if (BOT_TOKEN_REGEX.test(val)) setTokenType("bot");
                              else if (USER_TOKEN_REGEX.test(val)) setTokenType("user");
                              else if (BEARER_TOKEN_REGEX.test(val)) setTokenType("bearer");
                              else setTokenType(null);
                            }}
                          />
                        </div>

                        {Object.keys(pathParams).length > 0 && (
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {Object.keys(pathParams).map((key) => (
                              <div key={key}>
                                <label className={Styles.dialogLabel}>{key}</label>
                                <input
                                  type="text"
                                  className={Styles.dialogInput}
                                  value={pathParams[key]}
                                  onKeyDown={handleKeyDown}
                                  onChange={(e) => setPathParams((prev) => ({ ...prev, [key]: e.target.value }))}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between">
                            <label className={Styles.dialogLabel}>Query Parameters</label>
                          </div>
                          <div className="flex flex-col gap-2">
                            <datalist id="query-params-options">
                              {optionalQueryParams.map((param) => (
                                <option key={param} value={param} />
                              ))}
                            </datalist>
                            {queryParams.map((param, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Key"
                                  list="query-params-options"
                                  className={classNames(Styles.dialogInput, "flex-1")}
                                  value={param.key}
                                  onKeyDown={handleKeyDown}
                                  onChange={(e) => {
                                    const newParams = [...queryParams];
                                    newParams[index].key = e.target.value;
                                    if (index === newParams.length - 1 && (e.target.value || newParams[index].value)) {
                                      newParams.push({ key: "", value: "" });
                                    }
                                    setQueryParams(newParams);
                                  }}
                                />
                                <input
                                  type="text"
                                  placeholder="Value"
                                  className={classNames(Styles.dialogInput, "flex-1")}
                                  value={param.value}
                                  onKeyDown={handleKeyDown}
                                  onChange={(e) => {
                                    const newParams = [...queryParams];
                                    newParams[index].value = e.target.value;
                                    if (index === newParams.length - 1 && (newParams[index].key || e.target.value)) {
                                      newParams.push({ key: "", value: "" });
                                    }
                                    setQueryParams(newParams);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newParams = queryParams.filter((_, i) => i !== index);
                                    if (newParams.length === 0) {
                                      newParams.push({ key: "", value: "" });
                                    }
                                    setQueryParams(newParams);
                                  }}
                                  className="px-2 text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {method !== "GET" && (
                          <div>
                            <label className={Styles.dialogLabel}>Request Body (JSON)</label>
                            <textarea
                              className={classNames(Styles.dialogInput, "font-mono text-sm")}
                              rows={5}
                              value={body}
                              onChange={(e) => setBody(e.target.value)}
                              placeholder="{ ... }"
                            />
                          </div>
                        )}

                        {response && (
                          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Response</h3>
                            <div className="mt-2 text-left">
                              <div className="flex gap-2 text-sm">
                                <span
                                  className={classNames("font-bold", {
                                    "text-green-600": response.status >= 200 && response.status < 300,
                                    "text-red-600": response.status >= 400,
                                  })}
                                >
                                  {response.status} {response.statusText}
                                </span>
                              </div>

                              <div className="mt-2 border-b border-gray-200 dark:border-gray-700">
                                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                  <button
                                    onClick={() => setActiveTab("body")}
                                    className={classNames(
                                      activeTab === "body"
                                        ? "border-brand-blurple text-brand-blurple"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                                      "whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium",
                                    )}
                                  >
                                    Response Body
                                  </button>
                                  <button
                                    onClick={() => setActiveTab("headers")}
                                    className={classNames(
                                      activeTab === "headers"
                                        ? "border-brand-blurple text-brand-blurple"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                                      "whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium",
                                    )}
                                  >
                                    Headers
                                  </button>
                                </nav>
                              </div>

                              <div className="mt-2 max-h-96 overflow-auto rounded text-xs">
                                {activeTab === "body" ? (
                                  <Code className="language-json" forceCopy>
                                    {JSON.stringify(response.body, null, 2)}
                                  </Code>
                                ) : (
                                  <Code className="language-http" forceCopy>
                                    {Object.entries(response.headers)
                                      .map(([key, value]) => `${prettifyHeader(key)}: ${value}`)
                                      .join("\n")}
                                  </Code>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200 bg-white p-6 pt-4 dark:border-gray-700 dark:bg-[#2f3136]">
                  {isSettingsOpen ? (
                    <button
                      className="rounded-md bg-brand-blurple px-4 py-2 text-sm font-medium text-white hover:bg-brand-blurple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blurple focus-visible:ring-offset-2"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      Done
                    </button>
                  ) : (
                    <>
                      <button
                        className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        onClick={onClose}
                      >
                        Close
                      </button>
                      <button
                        className="rounded-md bg-brand-blurple px-4 py-2 text-sm font-medium text-white hover:bg-brand-blurple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blurple focus-visible:ring-offset-2 disabled:opacity-50"
                        onClick={handleSend}
                        disabled={loading || Object.values(pathParams).some((val) => !val)}
                      >
                        {loading ? "Sending..." : "Send Request"}
                      </button>
                    </>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
