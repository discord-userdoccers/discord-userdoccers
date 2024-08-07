import classNames from "classnames";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { useCallback, useMemo, useState } from "react";
import ReactDOMServer from "react-dom/server";
import Footer from "../components/Footer";
import MDX from "../components/MDX";
import Menu from "../components/Menu";
import OpenGraph, { DEFAULT_SECTION } from "../components/OpenGraph";
import MenuContext from "../contexts/MenuContext";

import "@docsearch/css";
import "../stylesheets/tailwind.css";
import "../stylesheets/styles.css";
import "../stylesheets/scrollbar.css";
import "../stylesheets/whitney/whitney.css";
import "../stylesheets/prism.css";
import "../stylesheets/youtube.css";
import "../stylesheets/snowflake-deconstruction.css";

const TITLE_REGEX = /<h1>(.*?)<\/h1>/;

export default function App({ Component, pageProps, router }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setOpen = useCallback(() => setSidebarOpen(true), []);
  const setClose = useCallback(() => setSidebarOpen(false), []);

  const fadeClasses = classNames(
    "absolute z-30 left-0 top-0 w-full h-full bg-black duration-300 md:opacity-0 md:pointer-events-none",
    {
      "opacity-50": sidebarOpen,
      "opacity-0 pointer-events-none": !sidebarOpen,
    },
  );

  const component = <Component {...pageProps} />;

  const getText = () => {
    if (router.pathname !== "/404") {
      const str = ReactDOMServer.renderToString(component);
      const title = TITLE_REGEX.exec(str)?.[1] ?? DEFAULT_SECTION;

      return {
        description:
          `${str
            .replace(/^(<h\d>(.*?)<\/h\d>)+/, "")
            .replaceAll(/<[^>]*>?/gm, " ")
            .replace(/\s+/gm, " ")
            .trim()
            .slice(0, 200)
            .trim()
            .replace(/&\w+$/, "")  }...`,
        title,
      };
    }
    return null;
  };

  const meta = useMemo(() => getText(), []);

  return (
    <ThemeProvider defaultTheme="system" attribute="data-theme">
      <MenuContext.Provider value={{ open: sidebarOpen, setOpen, setClose }}>
        {/* eslint-disable-next-line react/jsx-pascal-case */}
        <MDX>
          <OpenGraph description={meta?.description} section={meta?.title} />
          <div className="flex h-screen dark:bg-background-dark bg-white overflow-hidden">
            <div className={fadeClasses} onClick={() => setSidebarOpen(false)} />
            <Menu />

            <Component {...pageProps} />
          </div>
          <Footer />
        </MDX>
      </MenuContext.Provider>
    </ThemeProvider>
  );
}
