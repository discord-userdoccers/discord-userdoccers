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
import MenuContext from "../contexts/MenuContext";
import "@docsearch/css";
import { CodegenLanguageProvider } from "../lib/type-generator/store";
import OnThisPage from "../components/OnThisPage";

const TITLE_REGEX = /<h1 .*?><a .*?>([^<]+)<\/a>.*?<\/h1>|<h1>(.*?)<\/h1>/;

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
      const str = Component.meta?.description ?? ReactDOMServer.renderToString(component);
      const title = Component.meta?.title ?? TITLE_REGEX.exec(str)?.[1] ?? DEFAULT_SECTION;
      const description = handleDesc(str);

      return {
        description,
        title,
      };
    }
    return null;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const meta = useMemo(() => getText(), [router.pathname]);

  return (
    <>
      <ThemeProvider defaultTheme="system" attribute="data-theme">
        <MenuContext.Provider value={{ open: sidebarOpen, setOpen, setClose }}>
          <OpenGraph description={meta?.description} section={meta?.title} />
          <div className="flex min-h-[100dvh] overflow-hidden bg-white dark:bg-background-dark">
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
