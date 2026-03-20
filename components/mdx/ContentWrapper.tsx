import React, { useEffect, useRef } from "react";
import Header from "../Header";
import { EndpointProvider, useEndpointContext } from "../EndpointContext";

interface ContentWrapperProps {
  children: React.ReactNode;
}

function setElementVisibility(element: HTMLElement, visible: boolean) {
  element.style.display = visible ? "" : "none";
  element.toggleAttribute("data-endpoint-filter-hidden", !visible);
}

function FilteredContent({ children }: { children: React.ReactNode }) {
  const articleRef = useRef<HTMLElement>(null);
  const { search, showBot, showOAuth2, showUnauthenticated } = useEndpointContext();

  useEffect(() => {
    const article = articleRef.current;

    if (!article) return;

    const elements = Array.from(article.children) as HTMLElement[];
    const hasActiveFilters = showBot || showOAuth2 || showUnauthenticated;
    let isEndpointVisible = true;

    for (const element of elements) {
      if (element.tagName === "H2") {
        isEndpointVisible = true;
        setElementVisibility(element, true);
        continue;
      }

      if (element.dataset.routeHeader === "true") {
        const routeTitle = element.dataset.routeTitle ?? "";
        const searchMatch = !search || routeTitle.includes(search);
        const filterMatch =
          !hasActiveFilters ||
          (showBot && element.dataset.supportsBot === "true") ||
          (showOAuth2 && element.dataset.supportsOauth2 === "true") ||
          (showUnauthenticated && element.dataset.unauthenticated === "true");

        isEndpointVisible = searchMatch && filterMatch;
        setElementVisibility(element, isEndpointVisible);
        continue;
      }

      setElementVisibility(element, isEndpointVisible);
    }
  }, [search, showBot, showOAuth2, showUnauthenticated]);

  return (
    <article ref={articleRef} className="m-auto mt-0 xl:mt-4">
      {children}
    </article>
  );
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <EndpointProvider>
      <div
        className="relative flex flex-1 scroll-pt-16 flex-col items-center overflow-y-auto focus:outline-hidden xl:scroll-pt-0"
        style={{ scrollbarGutter: "stable" }}
      >
        <Header />
        <div className="h-16 xl:hidden" />
        <main className="desktop-content-left-pad desktop-content-max w-full p-4 sm:px-6 sm:pt-0 sm:pb-6 lg:px-10 lg:pb-10">
          <FilteredContent>{children}</FilteredContent>
        </main>
      </div>
    </EndpointProvider>
  );
}
