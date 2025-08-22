import classNames from "@lib/classnames";
import { ThemeProvider } from "next-themes";
import App, { type AppContext, type AppProps } from "next/app";
import { useCallback, useState } from "react";
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
import { CodegenLanguageProvider } from "../lib/type-generator/store";

const TITLE_REGEX = /<h1 .*?><a .*?>(\w+)<\/a>.*?<\/h1>|<h1>(.*?)<\/h1>/;

type Meta = { title: string; description: string };
type MyAppProps = AppProps & { Component: AppProps["Component"] & { meta?: Meta }; meta: Meta };

export default function MyApp({ Component, pageProps, meta }: MyAppProps) {
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

  return (
    <>
      <ThemeProvider defaultTheme="system" attribute="data-theme">
        <MenuContext.Provider value={{ open: sidebarOpen, setOpen, setClose }}>
          <OpenGraph description={meta?.description} section={meta?.title} />
          <div className="flex h-screen overflow-hidden bg-white dark:bg-background-dark">
            <div className={fadeClasses} onClick={() => setSidebarOpen(false)} />
            <Menu />

            <CodegenLanguageProvider>
              <MDX>
                <Component {...pageProps} />
              </MDX>
            </CodegenLanguageProvider>
          </div>
          <Footer />
        </MenuContext.Provider>
      </ThemeProvider>
    </>
  );
}

MyApp.getInitialProps = async (ctx: AppContext & { Component: MyAppProps["Component"] }) => {
  const { Component } = ctx;
  const component = (
    <CodegenLanguageProvider>
      <MDX>
        <Component />
      </MDX>
    </CodegenLanguageProvider>
  );

  const props = App.getInitialProps(ctx);

  if (ctx.router.pathname !== "/404") {
    const str = Component.meta?.description ?? ReactDOMServer.renderToString(component);
    const title = Component.meta?.title ?? TITLE_REGEX.exec(str)?.[1] ?? DEFAULT_SECTION;
    const description = `${str
      .replace(TITLE_REGEX, "")
      .replaceAll(/<[^>]*>/gm, " ")
      .replace(/\s+/gm, " ")
      .trim()
      .slice(0, 200)
      .trim()
      .replace(/&\w+$/, "")}...`;

    return {
      ...props,
      description,
      title,
      str,
    };
  }
  return { ...props };
};
