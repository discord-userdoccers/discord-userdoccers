import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import classNames from "@lib/classnames";
import { ListIcon } from "./mdx/icons/ListIcon";
import { type NavigationData, SITEMAP, type SubLink } from "./navigation/NavigationList";

const TOC_LABEL = "On this page";
const OPEN_TOC_LABEL = `Open ${TOC_LABEL}`;
const CLOSE_TOC_LABEL = `Close ${TOC_LABEL}`;
const MOBILE_QUERY = "(max-width: 767px)";
const MOBILE_OFFSET = 100;
const DESKTOP_OFFSET = 24;

const getTargetId = (link: string) => link.split("#")[1] ?? null;
const getActiveLinkClasses = (isActive: boolean) =>
  classNames("block rounded-md px-2 py-1", {
    "bg-theme-light-sidebar-hover text-theme-light-sidebar-hover-text dark:bg-theme-dark-sidebar-hover dark:text-white":
      isActive,
    "hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white":
      !isActive,
  });

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12" />
    </svg>
  );
}

export default function OnThisPage() {
  const router = useRouter();

  const subLinks = useMemo<SubLink[]>(() => {
    const pathname = router.pathname;
    for (const section of SITEMAP as NavigationData[]) {
      for (const page of section.pages) {
        if (page.link === pathname) {
          return page.subLinks ?? [];
        }
      }
    }
    return [];
  }, [router.pathname]);
  const tocItems = useMemo(
    () =>
      subLinks.map((s) => ({
        ...s,
        targetId: getTargetId(s.link),
        isSamePage: s.link.startsWith(`${router.pathname}#`),
      })),
    [subLinks, router.pathname],
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);

  // Update activeId on scroll using heading positions; listen to both container and window
  useEffect(() => {
    if (tocItems.length === 0) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const scrollEl = document.getElementById("content-scroll");
    const getOffset = () => (window.matchMedia(MOBILE_QUERY).matches ? MOBILE_OFFSET : DESKTOP_OFFSET);
    const ids = tocItems.map((item) => item.targetId).filter((id): id is string => Boolean(id));

    const getCurrent = () => {
      const offset = getOffset();
      let lastSeen: { id: string; top: number } | null = null;
      let firstUpcoming: { id: string; top: number } | null = null;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - offset <= 0) {
          if (!lastSeen || top > lastSeen.top) lastSeen = { id, top };
        } else if (!firstUpcoming || top < firstUpcoming.top) {
          firstUpcoming = { id, top };
        }
      }
      if (lastSeen) return lastSeen.id;
      if (firstUpcoming) return firstUpcoming.id;
      return ids[0] ?? null;
    };

    let rAF: number | null = null;
    const onScroll = () => {
      if (rAF != null) return;
      rAF = window.requestAnimationFrame(() => {
        rAF = null;
        const id = getCurrent();
        setActiveId((prev) => (prev !== id ? id : prev));
      });
    };

    // Initialize from current hash first, if present
    const initialHash = window.location.hash.replace("#", "");
    if (initialHash) setActiveId(initialHash);
    onScroll();

    const listeners: Array<[EventTarget, string, AddEventListenerOptions | undefined]> = [
      [window, "scroll", { passive: true }],
      [window, "resize", undefined],
      [window, "hashchange", undefined],
    ];
    if (scrollEl) listeners.push([scrollEl, "scroll", { passive: true }]);
    for (const [target, event, options] of listeners) {
      target.addEventListener(event, onScroll, options);
    }
    return () => {
      for (const [target, event] of listeners) {
        target.removeEventListener(event, onScroll);
      }
      if (rAF != null) cancelAnimationFrame(rAF);
    };
  }, [tocItems]);

  const closeFlyout = useCallback(() => {
    setTocOpen(false);
  }, []);

  if (tocItems.length === 0) return null;

  const renderLinks = (keyPrefix = "", onNavigate?: () => void) =>
    tocItems.map((item) => {
      const isActive = item.targetId != null && activeId === item.targetId;
      const className = getActiveLinkClasses(isActive);

      if (item.isSamePage) {
        return (
          <a
            key={`${keyPrefix}${item.link}`}
            href={item.targetId ? `#${item.targetId}` : item.link}
            className={className}
            aria-current={isActive ? "location" : undefined}
            onClick={onNavigate}
          >
            {item.name}
          </a>
        );
      }

      return (
        <Link
          key={`${keyPrefix}${item.link}`}
          href={item.link}
          prefetch={false}
          className={className}
          onClick={onNavigate}
        >
          {item.name}
        </Link>
      );
    });

  return (
    <>
      <aside className="desktop-right-toc text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text fixed top-6 z-20 hidden w-64 p-2 text-sm">
        <h3 className="font-whitney mb-3 text-xs text-black uppercase dark:text-white">{TOC_LABEL}</h3>
        <nav className="space-y-1">{renderLinks()}</nav>
      </aside>

      <button
        type="button"
        onClick={() => setTocOpen(true)}
        aria-label={OPEN_TOC_LABEL}
        title={OPEN_TOC_LABEL}
        aria-expanded={tocOpen}
        className="desktop-right-toc-fallback bg-brand-blurple fixed right-5 bottom-5 z-20 flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-lg"
      >
        <ListIcon className="h-4 w-4" />
        {TOC_LABEL}
      </button>

      <div
        className={classNames(
          "desktop-right-toc-fallback fixed inset-0 z-30 bg-black transition-opacity duration-300",
          tocOpen ? "opacity-50" : "pointer-events-none opacity-0",
        )}
        onClick={() => setTocOpen(false)}
      />

      <aside
        className={classNames(
          "desktop-right-toc-fallback text-theme-light-sidebar-text dark:bg-sidebar-tertiary-dark dark:text-theme-dark-sidebar-text fixed top-0 right-0 z-40 h-[100dvh] w-80 max-w-[90vw] bg-white p-4 text-sm transition-transform duration-300",
          tocOpen ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-whitney-bold text-xs text-black uppercase dark:text-white">{TOC_LABEL}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTocOpen(false)}
              aria-label={CLOSE_TOC_LABEL}
              title={CLOSE_TOC_LABEL}
              className={classNames(
                "rounded-md p-1 transition-colors",
                "text-theme-light-sidebar-text hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:text-theme-dark-sidebar-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white",
              )}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <nav className="space-y-1 overflow-y-auto pb-4">{renderLinks("mobile-", closeFlyout)}</nav>
      </aside>
    </>
  );
}
