import "../stylesheets/tailwind.css";
import "../stylesheets/styles.css";
import "../stylesheets/scrollbar.css";
import "../stylesheets/whitney/whitney.css";
import "../stylesheets/prism.css";
import "../stylesheets/youtube.css";
import "../stylesheets/snowflake-deconstruction.css";

import classNames from "@lib/classnames";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { useCallback, useMemo, useState } from "react";
import ReactDOMServer from "react-dom/server";
import Footer from "../components/Footer";
import MDX from "../components/MDX";
import Menu from "../components/Menu";
import OpenGraph, { DEFAULT_SECTION } from "../components/OpenGraph";
import { SITEMAP } from "../components/navigation/NavigationList";
import MenuContext from "../contexts/MenuContext";
import "@docsearch/css";
import { CodegenLanguageProvider } from "../lib/type-generator/store";
import OnThisPage from "../components/OnThisPage";
import { ThemeWatcher } from "../components/ThemeWatcher";

const TITLE_REGEX = /<h1 .*?><a .*?>([^<]+)<\/a>.*?<\/h1>|<h1>(.*?)<\/h1>/;

const isServer = typeof window === "undefined";

export default function App({
  Component,
  pageProps,
  router,
}: AppProps & { Component: AppProps["Component"] & { meta?: { title: string; description: string } } }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setOpen = useCallback(() => setSidebarOpen(true), []);
  const setClose = useCallback(() => setSidebarOpen(false), []);

  const fadeClasses = classNames("fixed z-30 inset-0 bg-black duration-300 md:opacity-0 md:pointer-events-none", {
    "opacity-50": sidebarOpen,
    "opacity-0 pointer-events-none": !sidebarOpen,
  });

  const component = (
    <CodegenLanguageProvider>
      <MDX>
        <Component {...pageProps} />
      </MDX>
    </CodegenLanguageProvider>
  );

  const getText = () => {
    if (router.pathname !== "/404") {
      if (Component.meta?.description) {
        return {
          title: Component.meta.title ?? DEFAULT_SECTION,
          description: Component.meta.description,
        };
      }

      if (isServer) {
        const str = ReactDOMServer.renderToString(component);
        return {
          title: TITLE_REGEX.exec(str)?.[1] ?? DEFAULT_SECTION,
          description: handleDesc(str),
        };
      }

      // We don't care about description on the client
      const page = SITEMAP.flatMap((s) => s.pages).find((p) => p.link === router.pathname);
      return {
        title: page?.name ?? DEFAULT_SECTION,
        description: undefined,
      };
    }
    return null;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const meta = useMemo(() => getText(), [router.pathname]);

  return (
    <>
      <ThemeProvider
        defaultTheme="system"
        attribute="data-theme"
        themes={["light", "dark", "amoled"]}
        value={{
          light: "light",
          dark: "dark",
          amoled: "dark",
        }}
      >
        <MenuContext.Provider value={{ open: sidebarOpen, setOpen, setClose }}>
          <ThemeWatcher />
          <OpenGraph description={meta?.description} section={meta?.title} />
          <div className="dark:bg-background-dark flex min-h-dvh overflow-hidden bg-white">
            <div className={fadeClasses} onClick={() => setSidebarOpen(false)} />
            <Menu />
            {component}
            <OnThisPage />
          </div>
          <Footer />
        </MenuContext.Provider>
      </ThemeProvider>
    </>
  );
}

function handleDesc(str: string) {
  return `${str
    .replace(TITLE_REGEX, "")
    .replaceAll(/<[^>]*>|\s+/gm, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .trim()
    .slice(0, 200)
    .trim()
    .replace(/&\w+$/, "")}...`;
}
