import type { AppProps } from "next/app";
import { useState } from "react";
import classNames from "classnames";
import MDX from "../components/MDX";
import OpenGraph from "../components/OpenGraph";
import Header from "../components/Header";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import "tailwindcss/tailwind.css";
import "../stylesheets/whitney/whitney.css";
import "../stylesheets/code.css";
import "../stylesheets/snowflake-deconstruction.css";

export default function App({ Component, pageProps }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fadeClasses = classNames(
    "absolute z-30 left-0 top-0 w-full h-full bg-black duration-300 md:opacity-0 md:pointer-events-none",
    {
      "opacity-50": sidebarOpen,
      "opacity-0 pointer-events-none": !sidebarOpen,
    }
  );

  return (
    <MDX>
      <OpenGraph />
      <div className="dark:bg-background-dark flex h-screen bg-white overflow-hidden">
        <div className={fadeClasses} onClick={() => setSidebarOpen(false)} />
        <Menu open={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="relative flex flex-1 flex-col items-center focus:outline-none overflow-y-auto">
          <Header setSidebarOpen={setSidebarOpen} />
          <div className="pb-10 px-10 w-full max-w-6xl">
            <Component {...pageProps} />
          </div>
        </main>
      </div>
      <Footer />
    </MDX>
  );
}
