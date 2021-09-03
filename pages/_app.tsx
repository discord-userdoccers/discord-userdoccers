import type { AppProps } from "next/app";
import { useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import MDX from "../components/MDX";
import OpenGraph from "../components/OpenGraph";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import MenuContext from "../contexts/MenuContext";
import "tailwindcss/tailwind.css";
import "../stylesheets/whitney/whitney.css";
import "../stylesheets/prism.css";
import "../stylesheets/youtube.css";
import "../stylesheets/snowflake-deconstruction.css";

export default function App({ Component, pageProps }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setOpen = useCallback(() => setSidebarOpen(true), []);
  const setClose = useCallback(() => setSidebarOpen(false), []);

  const fadeClasses = classNames(
    "absolute z-30 left-0 top-0 w-full h-full bg-black duration-300 md:opacity-0 md:pointer-events-none",
    {
      "opacity-50": sidebarOpen,
      "opacity-0 pointer-events-none": !sidebarOpen,
    }
  );

  return (
    <MenuContext.Provider value={{ open: sidebarOpen, setOpen, setClose }}>
      <MDX>
        <OpenGraph />
        <div className="flex h-screen dark:bg-background-dark bg-white overflow-hidden">
          <div className={fadeClasses} onClick={() => setSidebarOpen(false)} />
          <Menu />

          <Component {...pageProps} />
        </div>
        <Footer />
      </MDX>
    </MenuContext.Provider>
  );
}
