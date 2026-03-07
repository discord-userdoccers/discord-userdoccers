import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import classNames from "@lib/classnames";
import { ListIcon } from "./mdx/icons/ListIcon";
import { type NavigationData, SITEMAP, type SubLink } from "./navigation/NavigationList";

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14 3 7 7-2 2-3-1-3 3 1 3-2 2-3-3-5 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3 8 9" />
    </svg>
  );
}

export default function OnThisPage() {
  const router = useRouter();
  const tocLabel = "On this page";
  const closeLabel = "Close";
  const pinLabel = "Pin";
  const unpinLabel = "Unpin";
  const pinFlyoutLabel = `${pinLabel} ${tocLabel} flyout`;
  const unpinFlyoutLabel = `${unpinLabel} ${tocLabel} flyout`;
  const keepOpenTooltip = "Click to keep this open";
  const autoCloseTooltip = "Click to unpin and auto-close on link click";
  const openTocLabel = `Open ${tocLabel}`;
  const closeTocLabel = `Close ${tocLabel}`;

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

  const [activeId, setActiveId] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [tocPinned, setTocPinned] = useState(false);
  const pinTooltip = tocPinned ? autoCloseTooltip : keepOpenTooltip;

  // Update activeId on scroll using heading positions; listen to both container and window
  useEffect(() => {
    if (subLinks.length === 0) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const scrollEl = document.getElementById("content-scroll") as HTMLElement | null;
    const OFFSET = 100; // account for header spacing
    const ids = subLinks.map((s) => s.link.split("#")[1]).filter((id): id is string => Boolean(id));

    const getCurrent = () => {
      const tops: Array<{ id: string; top: number }> = [];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        tops.push({ id, top: rect.top });
      }
      const candidates = tops.filter((t) => t.top - OFFSET <= 0).sort((a, b) => a.top - b.top);
      if (candidates.length > 0) return candidates[candidates.length - 1].id;
      const upcoming = tops.filter((t) => t.top - OFFSET > 0).sort((a, b) => a.top - b.top);
      if (upcoming.length > 0) return upcoming[0].id;
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

    const add = (
      el: EventTarget | null,
      name: string,
      handler: EventListenerOrEventListenerObject,
      opts?: AddEventListenerOptions,
    ) => {
      if (el && el.addEventListener) el.addEventListener(name, handler, opts);
    };
    const remove = (el: EventTarget | null, name: string, handler: EventListenerOrEventListenerObject) => {
      if (el && el.removeEventListener) el.removeEventListener(name, handler);
    };

    add(scrollEl, "scroll", onScroll, { passive: true });
    add(window, "scroll", onScroll, { passive: true });
    add(window, "resize", onScroll);
    add(window, "hashchange", onScroll);
    return () => {
      remove(scrollEl, "scroll", onScroll);
      remove(window, "scroll", onScroll);
      remove(window, "resize", onScroll);
      remove(window, "hashchange", onScroll);
      if (rAF != null) cancelAnimationFrame(rAF);
    };
  }, [subLinks]);

  useEffect(() => {
    if (!tocPinned) setTocOpen(false);
  }, [router.asPath, tocPinned]);

  if (subLinks.length === 0) return null;

  const getLinkClasses = (isActive: boolean) =>
    classNames("block rounded-md px-2 py-1", {
      "bg-theme-light-sidebar-hover text-theme-light-sidebar-hover-text dark:bg-theme-dark-sidebar-hover dark:text-white":
        isActive,
      "hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white":
        !isActive,
    });

  const renderLinks = (keyPrefix = "", onNavigate?: () => void) =>
    subLinks.map((s) => {
      const isSamePage = s.link.startsWith(`${router.pathname}#`);
      const targetId = s.link.split("#")[1] ?? null;
      const isActive = targetId != null && activeId === targetId;
      const className = getLinkClasses(isActive);

      if (isSamePage) {
        return (
          <a
            key={`${keyPrefix}${s.link}`}
            href={targetId ? `#${targetId}` : s.link}
            className={className}
            aria-current={isActive ? "location" : undefined}
            onClick={onNavigate}
          >
            {s.name}
          </a>
        );
      }

      return (
        <Link key={`${keyPrefix}${s.link}`} href={s.link} prefetch={false} className={className} onClick={onNavigate}>
          {s.name}
        </Link>
      );
    });

  return (
    <>
      <aside className="desktop-right-toc text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text fixed top-6 z-20 hidden w-64 p-2 text-sm">
        <h3 className="font-whitney mb-3 text-xs text-black uppercase dark:text-white">{tocLabel}</h3>
        <nav className="space-y-1">{renderLinks()}</nav>
      </aside>

      <button
        type="button"
        onClick={() => setTocOpen(true)}
        aria-label={openTocLabel}
        title={openTocLabel}
        aria-expanded={tocOpen}
        className="desktop-right-toc-fallback bg-brand-blurple fixed right-5 bottom-5 z-20 flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-lg"
      >
        <ListIcon className="h-4 w-4" />
        {tocLabel}
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
          <h3 className="font-whitney-bold text-xs text-black uppercase dark:text-white">{tocLabel}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTocPinned((value) => !value)}
              aria-label={tocPinned ? unpinFlyoutLabel : pinFlyoutLabel}
              aria-pressed={tocPinned}
              title={pinTooltip}
              className={classNames(
                "rounded-md p-1 transition-colors",
                tocPinned
                  ? "bg-theme-light-sidebar-hover text-theme-light-sidebar-hover-text dark:bg-theme-dark-sidebar-hover dark:text-white"
                  : "text-theme-light-sidebar-text hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:text-theme-dark-sidebar-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white",
              )}
            >
              <PinIcon className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setTocOpen(false)} aria-label={closeTocLabel}>
              {closeLabel}
            </button>
          </div>
        </div>
        <nav className="space-y-1 overflow-y-auto pb-4">
          {renderLinks("mobile-", () => {
            if (!tocPinned) setTocOpen(false);
          })}
        </nav>
      </aside>
    </>
  );
}
