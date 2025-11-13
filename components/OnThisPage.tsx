import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { type NavigationData, SITEMAP, type SubLink } from "./navigation/NavigationList";

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

  const [activeId, setActiveId] = useState<string | null>(null);

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

    const add = (el: EventTarget | null, name: string, handler: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
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

  if (subLinks.length === 0) return null;

  return (
    <aside className="desktop-right-toc fixed top-6 z-20 hidden w-64 p-2 text-sm text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text">
      <h3 className="mb-3 font-whitney-bold text-xs uppercase text-black dark:text-white">On this page</h3>
      <nav className="space-y-1">
        {subLinks.map((s) => {
          const isSamePage = s.link.startsWith(`${router.pathname}#`);
          const targetId = s.link.split("#")[1] ?? null;
          const isActive = targetId != null && activeId === targetId;
          const className = [
            "block rounded-md px-2 py-1",
            isActive
              ? "bg-theme-light-sidebar-hover text-theme-light-sidebar-hover-text dark:bg-theme-dark-sidebar-hover dark:text-white"
              : "hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white",
          ].join(" ");
          return isSamePage ? (
            <a
              key={s.link}
              href={targetId ? `#${targetId}` : s.link}
              className={className}
              aria-current={isActive ? "location" : undefined}
            >
              {s.name}
            </a>
          ) : (
            <Link key={s.link} href={s.link} prefetch={false} className={className}>
              {s.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
