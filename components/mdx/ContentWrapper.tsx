import React from "react";
import Header from "../Header";
import { EndpointProvider, useEndpointContext } from "../EndpointContext";
import RouteHeader, { getRawText, RouteHeaderProps } from "../RouteHeader";
import { H2 } from "./Heading";

interface ContentWrapperProps {
  children: React.ReactNode;
}

function isRouteHeader(child: React.ReactNode): child is React.ReactElement<RouteHeaderProps> {
  if (!React.isValidElement(child)) return false;
  const type = child.type;
  if (type === RouteHeader) return true;
  if (typeof type === "function" && (type as { displayName?: string }).displayName === "RouteHeader") return true;
  const props = child.props as Partial<RouteHeaderProps>;
  if (typeof props.method === "string" && typeof props.url === "string") {
    return true;
  }
  return false;
}

function isH2(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false;
  const type = child.type;
  if (type === H2) return true;
  if (typeof type === "function" && (type as { displayName?: string }).displayName === "H2") return true;
  return false;
}

function FilteredContent({ children }: { children: React.ReactNode }) {
  const { search, showBot, showOAuth2, showUnauthenticated } = useEndpointContext();

  const childArray = React.Children.toArray(children);

  let isEndpointVisible = true;

  const filtered = childArray.map((child) => {
    if (!React.isValidElement(child)) {
      return isEndpointVisible ? child : null;
    }

    if (isH2(child)) {
      // eslint-disable-next-line react-hooks/immutability
      isEndpointVisible = true;
      return child;
    }

    if (isRouteHeader(child)) {
      const props = child.props;
      const rawText = getRawText(props.children).toLowerCase();

      const searchMatch = !search || rawText.includes(search);

      let filterMatch = true;
      const hasActiveFilters = showBot || showOAuth2 || showUnauthenticated;

      if (hasActiveFilters) {
        filterMatch =
          (showBot && props.supportsBot) ||
          (showOAuth2 && !!props.supportsOAuth2) ||
          (showUnauthenticated && props.unauthenticated) ||
          false;
      } else {
        filterMatch = true;
      }

      const isVisible = !!(searchMatch && filterMatch);
      isEndpointVisible = isVisible;

      return isVisible ? child : null;
    }

    return isEndpointVisible ? child : null;
  });

  return <>{filtered}</>;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <EndpointProvider>
      <div
        className="relative flex flex-1 scroll-pt-16 flex-col items-center overflow-y-auto focus:outline-none md:scroll-pt-0"
        style={{ scrollbarGutter: "stable" }}
      >
        <Header />
        <main className="desktop-content-left-pad desktop-content-max w-full p-4 sm:px-6 sm:pb-6 sm:pt-0 lg:px-10 lg:pb-10">
          <article className="m-auto mt-0 md:mt-4">
            <FilteredContent>{children}</FilteredContent>
          </article>
        </main>
      </div>
    </EndpointProvider>
  );
}
